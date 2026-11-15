import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

export interface PlayerRanking {
  name: string
  total: number
  reward: string
}

export interface Game {
  id: string
  createdAt: string
  title: string
  rewards: string[]
  board: number[][]
  rankings: PlayerRanking[]
  activeCell: { r: number; c: number }
  showKeyboard: boolean
}

export interface Table {
  id: string
  createdAt: string
  players: string[]
  games: Game[]
}

interface SamlogState {
  tables: Table[]
  addTable: (players: string[]) => string
  deleteTable: (tableId: string) => void
  addGame: (tableId: string, title: string, rewards: string[]) => string | null
  copyGame: (tableId: string, gameId: string) => string | null
  deleteGame: (tableId: string, gameId: string) => void
  editGame: (tableId: string, gameId: string, title: string, rewards: string[]) => void
  startRound: (tableId: string, gameId: string) => void
  appendDigit: (tableId: string, gameId: string, digit: number) => void
  backspace: (tableId: string, gameId: string) => void
  moveActivePlayer: (tableId: string, gameId: string, delta: number) => void
  finishRound: (tableId: string, gameId: string) => void
  selectCell: (tableId: string, gameId: string, row: number, col: number) => void
}

const STORAGE_KEY = 'samlog_tables'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function resetTransientState(tables: Table[]): Table[] {
  return tables.map((table) => ({
    ...table,
    games: table.games.map((game) => ({
      ...game,
      activeCell: { r: -1, c: -1 },
      showKeyboard: false,
    })),
  }))
}

// Zustand persist normally stores an envelope. SamLog's Vue app stored the
// tables array directly, so this adapter keeps the same localStorage shape.
const compatibleStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name)
    if (!raw) return null
    try {
      const value: unknown = JSON.parse(raw)
      if (Array.isArray(value)) {
        return JSON.stringify({ state: { tables: value }, version: 0 })
      }
      if (value && typeof value === 'object') return raw
      return null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      const parsed = JSON.parse(value) as { state?: { tables?: Table[] } }
      const tables = Array.isArray(parsed.state?.tables) ? parsed.state.tables : []
      localStorage.setItem(name, JSON.stringify(resetTransientState(tables)))
    } catch {
      // Storage can be blocked or full; the app remains usable for this session.
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
}

function updateGame(
  tables: Table[],
  tableId: string,
  gameId: string,
  updater: (game: Game, table: Table) => Game,
): Table[] {
  return tables.map((table) =>
    table.id !== tableId
      ? table
      : {
          ...table,
          games: table.games.map((game) =>
            game.id === gameId ? updater(game, table) : game,
          ),
        },
  )
}

function rankPlayers(board: number[][], players: string[], rewards: string[]): PlayerRanking[] {
  return board
    .map((row, index) => ({ name: players[index] ?? '', total: row.reduce((sum, score) => sum + score, 0) }))
    .sort((a, b) => a.total - b.total)
    .map((player, index) => ({ ...player, reward: rewards[index] ?? '' }))
}

export const useSamlogStore = create<SamlogState>()(
  persist(
    (set, get) => ({
      tables: [],
      addTable: (players) => {
        const id = uid()
        set((state) => ({
          tables: [...state.tables, { id, createdAt: new Date().toISOString(), players, games: [] }],
        }))
        return id
      },
      deleteTable: (tableId) => set((state) => ({ tables: state.tables.filter((table) => table.id !== tableId) })),
      addGame: (tableId, title, rewards) => {
        const table = get().tables.find((item) => item.id === tableId)
        if (!table) return null
        const id = uid()
        const game: Game = {
          id,
          createdAt: new Date().toISOString(),
          title: title.trim() || `Ván #${table.games.length + 1}`,
          rewards: [...rewards],
          board: table.players.map(() => []),
          rankings: table.players.map((name, index) => ({ name, total: 0, reward: rewards[index] ?? '' })),
          activeCell: { r: -1, c: -1 },
          showKeyboard: false,
        }
        set((state) => ({ tables: state.tables.map((item) => item.id === tableId ? { ...item, games: [...item.games, game] } : item) }))
        return id
      },
      copyGame: (tableId, gameId) => {
        const table = get().tables.find((item) => item.id === tableId)
        const original = table?.games.find((item) => item.id === gameId)
        if (!table || !original) return null
        const lastNumber = original.title.match(/(\d+)$/)?.[1]
        const title = lastNumber
          ? original.title.replace(/\d+$/, String(Number.parseInt(lastNumber, 10) + 1))
          : `${original.title} #2`
        const id = uid()
        const game: Game = {
          id,
          createdAt: new Date().toISOString(),
          title,
          rewards: [...original.rewards],
          board: table.players.map(() => []),
          rankings: original.rankings.map((ranking) => ({ ...ranking, total: 0 })),
          activeCell: { r: -1, c: -1 },
          showKeyboard: false,
        }
        set((state) => ({ tables: state.tables.map((item) => item.id === tableId ? { ...item, games: [...item.games, game] } : item) }))
        return id
      },
      deleteGame: (tableId, gameId) => set((state) => ({
        tables: state.tables.map((table) => table.id === tableId ? { ...table, games: table.games.filter((game) => game.id !== gameId) } : table),
      })),
      editGame: (tableId, gameId, title, rewards) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game, table) => {
          const nextRewards = [...rewards]
          return {
            ...game,
            title: title.trim() || game.title,
            rewards: nextRewards,
            rankings: rankPlayers(game.board, table.players, nextRewards),
          }
        }),
      })),
      startRound: (tableId, gameId) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game) => {
          const board = game.board.map((row) => [...row, 0])
          return { ...game, board, activeCell: { r: 0, c: board[0]?.length ? board[0].length - 1 : 0 }, showKeyboard: true }
        }),
      })),
      appendDigit: (tableId, gameId, digit) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game, table) => {
          const { r, c } = game.activeCell
          if (r < 0 || c < 0) return game
          const board = game.board.map((row) => [...row])
          const current = board[r]?.[c] ?? 0
          if (String(current).length >= 3) return game
          board[r]![c] = Number(`${current}${digit}`)
          return { ...game, board, rankings: rankPlayers(board, table.players, game.rewards) }
        }),
      })),
      backspace: (tableId, gameId) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game, table) => {
          const { r, c } = game.activeCell
          if (r < 0 || c < 0) return game
          const board = game.board.map((row) => [...row])
          const value = String(board[r]?.[c] ?? 0)
          board[r]![c] = value.length <= 1 ? 0 : Number(value.slice(0, -1))
          return { ...game, board, rankings: rankPlayers(board, table.players, game.rewards) }
        }),
      })),
      moveActivePlayer: (tableId, gameId, delta) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game, table) => {
          const r = game.activeCell.r
          if (r < 0) return game
          return { ...game, activeCell: { ...game.activeCell, r: (r + delta + table.players.length) % table.players.length } }
        }),
      })),
      finishRound: (tableId, gameId) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game) => {
          const last = (game.board[0]?.length ?? 0) - 1
          const board = game.board.map((row) => [...row])
          if (last >= 0 && board.every((row) => (row[last] ?? 0) === 0)) board.forEach((row) => row.pop())
          return { ...game, board, activeCell: { r: -1, c: -1 }, showKeyboard: false }
        }),
      })),
      selectCell: (tableId, gameId, row, col) => set((state) => ({
        tables: updateGame(state.tables, tableId, gameId, (game) => ({ ...game, activeCell: { r: row, c: col }, showKeyboard: true })),
      })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => compatibleStorage),
      partialize: (state) => ({ tables: state.tables }) as SamlogState,
      merge: (persisted, current) => {
        const saved = persisted as Partial<SamlogState> | undefined
        return { ...current, tables: resetTransientState(saved?.tables ?? []) }
      },
    },
  ),
)

export function getBoardLength(game: Game): number {
  return game.board[0]?.length ?? 0
}
