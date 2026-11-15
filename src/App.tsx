import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart2, Check, ChevronLeft, ChevronRight, Copy, Delete, Dices,
  Pencil, Plus, Trash2, Users, X,
} from 'lucide-react'
import {
  Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate,
  useOutletContext, useParams,
} from 'react-router-dom'
import { getBoardLength, type Game, type Table, useSamlogStore } from './store'
import BottomSheet from './components/BottomSheet'

type SheetState = { kind: 'table' | 'game'; tableId: string; gameId?: string; title: string }
type ConfirmState = { title: string; message: string; confirmText: string; onConfirm: () => void }
type ShellContext = {
  openTableSheet: (table: Table) => void
  openGameSheet: (table: Table, game: Game) => void
  askDeleteTable: (table: Table) => void
  askDeleteGame: (table: Table, game: Game) => void
  toast: (message: string) => void
}

const cx = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(' ')

function tapHaptic() {
  try { navigator.vibrate?.(50) } catch { /* Haptics are optional and browser-dependent. */ }
}

function LongPressCard({ children, onLongPress }: { children: React.ReactNode; onLongPress: () => void }) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const triggered = useRef(false)
  const cancel = () => { window.clearTimeout(timer.current); timer.current = undefined; start.current = null }
  return <article
    className="card flex items-stretch long-press-card"
    onPointerDown={(event) => {
      if (event.button !== 0) return
      cancel()
      triggered.current = false
      start.current = { x: event.clientX, y: event.clientY }
      timer.current = window.setTimeout(() => { triggered.current = true; tapHaptic(); onLongPress() }, 500)
    }}
    onPointerMove={(event) => {
      if (!start.current) return
      if (Math.abs(event.clientX - start.current.x) > 10 || Math.abs(event.clientY - start.current.y) > 10) cancel()
    }}
    onPointerUp={cancel}
    onPointerCancel={cancel}
    onPointerLeave={cancel}
    onContextMenu={(event) => event.preventDefault()}
    onClickCapture={(event) => { if (triggered.current) { event.preventDefault(); event.stopPropagation(); triggered.current = false } }}
  >{children}</article>
}

function titleCase(value: string): string {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

function rewardDisplay(value: string) {
  const number = Number(value)
  const numeric = !Number.isNaN(number) && value.trim() !== ''
  if (!numeric || number === 0) return { text: value || '', color: 'text-foreground' }
  return { text: number > 0 ? `+${number}` : String(number), color: number > 0 ? 'text-green-400' : 'text-red-400' }
}

const rankStyles = [
  'text-green-400 border-green-500/20 bg-green-500/10',
  'text-lime-400 border-lime-500/20 bg-lime-500/10',
  'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
  'text-orange-400 border-orange-500/20 bg-orange-500/10',
  'text-red-400 border-red-500/20 bg-red-500/10',
]

function rankStyle(index: number) {
  return rankStyles[index] ?? 'text-muted-foreground border-border bg-muted'
}

function scoreColor(score: number) {
  if (score === 0) return 'text-green-400'
  if (score <= 3) return 'text-lime-400'
  if (score <= 6) return 'text-yellow-400'
  if (score <= 9) return 'text-orange-400'
  return 'text-red-400'
}

function rewardPlaceholder(index: number, count: number): string {
  if (index === 0) return '+100'
  if (index === count - 1) return '-100'
  if (index === 1) return '+50'
  if (count === 5 && index === 2) return '0'
  return '-50'
}

function AppShell() {
  const tables = useSamlogStore((state) => state.tables)
  const deleteTable = useSamlogStore((state) => state.deleteTable)
  const deleteGame = useSamlogStore((state) => state.deleteGame)
  const copyGame = useSamlogStore((state) => state.copyGame)
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmState | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const table = tables.find((item) => item.id === params.tableId)
  const game = table?.games.find((item) => item.id === params.gameId)
  const path = location.pathname
  const home = path === '/'
  const newTable = path === '/tables/new'
  const tableDetail = Boolean(table && path === `/tables/${table.id}`)
  const newGame = Boolean(table && path === `/tables/${table.id}/games/new`)
  const editGame = Boolean(table && game && path.endsWith('/edit'))
  const gameBoard = Boolean(table && game && !editGame && path.includes('/games/'))
  const header = useMemo(() => {
    if (newTable) return { title: 'Tạo bàn mới', subtitle: 'Nhập tên những người cùng chơi' }
    if (tableDetail && table) return { title: table.players.map(titleCase).join(' · '), subtitle: `${table.games.length} ván · ${table.games.reduce((sum, item) => sum + getBoardLength(item), 0)} vòng` }
    if (newGame) return { title: 'Ván mới', subtitle: 'Đặt tên và thưởng/phạt cho ván' }
    if (editGame) return { title: 'Sửa ván', subtitle: game?.title ?? '' }
    if (gameBoard) return { title: game?.title ?? '', subtitle: game ? formatDate(game.createdAt) : '' }
    return { title: 'SamLog', subtitle: 'Ghi điểm' }
  }, [newTable, tableDetail, table, newGame, editGame, gameBoard, game])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const toast = (message: string) => {
    setToastMessage(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 2200)
  }

  const askDeleteTable = (item: Table) => setConfirmation({
    title: 'Xóa bàn chơi này?',
    message: `Bàn ${item.players.map(titleCase).join(', ')} và ${item.games.length} ván sẽ bị xóa vĩnh viễn, không thể khôi phục.`,
    confirmText: 'Xóa bàn',
    onConfirm: () => { deleteTable(item.id); toast('Đã xóa bàn') },
  })

  const askDeleteGame = (owner: Table, item: Game) => setConfirmation({
    title: 'Xóa ván này?',
    message: `Ván "${item.title}" cùng toàn bộ bảng điểm sẽ bị xóa vĩnh viễn, không thể khôi phục.`,
    confirmText: 'Xóa ván',
    onConfirm: () => { deleteGame(owner.id, item.id); toast('Đã xóa ván') },
  })

  const context: ShellContext = {
    openTableSheet: (item) => setSheet({ kind: 'table', tableId: item.id, title: item.players.map(titleCase).join(' · ') }),
    openGameSheet: (owner, item) => setSheet({ kind: 'game', tableId: owner.id, gameId: item.id, title: item.title }),
    askDeleteTable,
    askDeleteGame,
    toast,
  }

  function goBack() {
    if (gameBoard && table) navigate(`/tables/${table.id}`)
    else if (tableDetail) navigate('/')
    else if (newTable) navigate('/')
    else if (newGame && table) navigate(`/tables/${table.id}`)
    else if (editGame && table && game) navigate(`/tables/${table.id}/games/${game.id}`)
    else navigate('/')
  }

  return (
    <div className="root flex h-dvh w-full flex-col gap-3" onClick={() => tapHaptic()}>
      <header className={cx('app-header', home && 'home-header')}>
        {!home && <button className="icon-btn" aria-label="Quay lại" onClick={goBack}><ChevronLeft className="size-6" /></button>}
        <div className="min-w-0 flex-1"><h1 className="app-title">{header.title}</h1>{header.subtitle && <p className="app-subtitle">{header.subtitle}</p>}</div>
        {gameBoard && table && game && <Link className="icon-btn" aria-label="Sửa tên và thưởng/phạt" to={`/tables/${table.id}/games/${game.id}/edit`}><Pencil className="size-5" /></Link>}
      </header>

      <Outlet context={context} />

      {sheet && (
        <BottomSheet title={sheet.title} onClose={() => setSheet(null)}>
            {sheet.kind === 'table' && <button className="sheet-item" onClick={() => { setSheet(null); navigate(`/tables/${sheet.tableId}`) }}><Users className="size-5 shrink-0" /><span className="sheet-text"><span className="font-semibold">Mở bàn này</span></span></button>}
            {sheet.kind === 'game' && <>
              <button className="sheet-item" onClick={() => {
                const copiedId = sheet.gameId ? copyGame(sheet.tableId, sheet.gameId) : null
                setSheet(null)
                if (copiedId) { navigate(`/tables/${sheet.tableId}/games/${copiedId}`); toast('Đã tạo ván mới, bảng điểm trống') }
              }}><Copy className="size-5 shrink-0" /><span className="sheet-text"><span className="font-semibold">Tạo ván mới từ ván này</span><span className="sheet-desc">Giữ nguyên thưởng/phạt, bảng điểm để trống</span></span></button>
              <button className="sheet-item" onClick={() => { const id = sheet.gameId; const tableId = sheet.tableId; setSheet(null); if (id) navigate(`/tables/${tableId}/games/${id}/edit`) }}><Pencil className="size-5 shrink-0" /><span className="sheet-text"><span className="font-semibold">Sửa tên và thưởng/phạt</span></span></button>
            </>}
            <div className="sheet-divider" />
            <button className="sheet-item sheet-danger" onClick={() => {
              const current = tables.find((item) => item.id === sheet.tableId)
              const selectedGame = current?.games.find((item) => item.id === sheet.gameId)
              setSheet(null)
              if (current && sheet.kind === 'table') askDeleteTable(current)
              else if (current && selectedGame) askDeleteGame(current, selectedGame)
            }}><Trash2 className="size-5 shrink-0" /><span className="sheet-text"><span className="font-semibold">{sheet.kind === 'table' ? 'Xóa bàn này' : 'Xóa ván này'}</span></span></button>
        </BottomSheet>
      )}

      {confirmation && <div className="overlay overlay-center" onClick={(event) => { if (event.target === event.currentTarget) setConfirmation(null) }}>
        <div className="dialog" role="alertdialog" aria-modal="true" aria-label={confirmation.title}>
          <h2 className="t-main text-base font-bold">{confirmation.title}</h2><p className="t-sub text-sm leading-relaxed">{confirmation.message}</p>
          <div className="grid grid-cols-2 gap-2.5 pt-1"><button className="btn-secondary" onClick={() => setConfirmation(null)}>Hủy</button><button className="btn-danger" onClick={() => { const action = confirmation.onConfirm; setConfirmation(null); action() }}>{confirmation.confirmText}</button></div>
        </div>
      </div>}
      {toastMessage && <div className="toast" role="status">{toastMessage}</div>}
    </div>
  )
}

function useShell() { return useOutletContext<ShellContext>() }

function HomePage() {
  const tables = useSamlogStore((state) => state.tables)
  const addTable = useSamlogStore((state) => state.addTable)
  const navigate = useNavigate()
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [playerText, setPlayerText] = useState('')
  const { openTableSheet } = useShell()
  const names = playerText.trim().split(/\s+/).filter(Boolean)
  const duplicateNames = new Set(names.map((name) => name.toLowerCase())).size !== names.length
  const canCreate = names.length >= 2 && names.length <= 5 && !duplicateNames
  const hint = duplicateNames
    ? 'Có hai người trùng tên.'
    : names.length < 2
      ? 'Mỗi tên cách nhau bằng dấu cách.'
      : names.length > 5
        ? 'Tối đa 5 người chơi.'
        : `${names.length} người chơi.`
  return <>
    <main className="content">
      {tables.length === 0 && <div className="empty"><div className="icon-box"><Users className="size-5" /></div><p className="empty-title">Chưa có bàn chơi nào</p><p className="empty-text">Mỗi bàn là một nhóm bạn chơi cùng nhau. Bấm "Tạo bàn mới" bên dưới để bắt đầu.</p></div>}
      {[...tables].reverse().map((table) => <LongPressCard key={table.id} onLongPress={() => openTableSheet(table)}>
        <Link className="flex min-w-0 flex-1 items-center gap-3.5 p-4 text-left" to={`/tables/${table.id}`}>
          <div className="icon-box"><Users className="size-5" /></div><div className="flex min-w-0 flex-col gap-1.5"><p className="t-main truncate text-sm font-semibold">{table.players.map(titleCase).join(' · ')}</p><div className="t-sub flex items-center gap-3 text-xs"><span className="flex items-center gap-1"><Dices className="size-3.5" />{table.games.length} ván</span><span className="flex items-center gap-1"><BarChart2 className="size-3.5" />{table.games.reduce((sum, game) => sum + getBoardLength(game), 0)} vòng</span></div></div>
        </Link>
      </LongPressCard>)}
    </main><footer className="footer"><button className="btn-primary w-full" onClick={() => { setPlayerText(''); setShowCreateSheet(true) }}><Plus className="size-5" />Tạo bàn mới</button></footer>
    {showCreateSheet && <BottomSheet title="Tạo bàn mới" onClose={() => setShowCreateSheet(false)}>
      <form className="sheet-form" onSubmit={(event) => { event.preventDefault(); if (!canCreate) return; const id = addTable(names); setShowCreateSheet(false); navigate(`/tables/${id}/games/new`) }}>
        <label className="field-label px-3" htmlFor="player-names">Tên người chơi</label>
        <input id="player-names" autoFocus value={playerText} onChange={(event) => setPlayerText(event.target.value)} type="text" maxLength={64} autoComplete="off" autoCapitalize="words" spellCheck={false} placeholder="" aria-label="Tên người chơi, cách nhau bằng dấu cách" className="sam-input sheet-input" />
        <p className={cx('px-3 text-sm', duplicateNames || names.length > 5 ? 't-error' : 't-sub')}>{hint}</p>
        <div className="px-3 pt-1"><button className="btn-primary w-full" disabled={!canCreate}>Tạo bàn</button></div>
      </form>
    </BottomSheet>}
  </>
}

function NewTablePage() {
  const addTable = useSamlogStore((state) => state.addTable)
  const navigate = useNavigate()
  const [players, setPlayers] = useState(['', '', ''])
  const names = players.map((name) => name.trim()).filter(Boolean)
  const duplicate = new Set(names.map((name) => name.toLowerCase())).size !== names.length
  const canCreate = names.length >= 2 && !duplicate
  const hint = duplicate ? 'Có hai người trùng tên.' : names.length < 2 ? 'Nhập ít nhất 2 tên.' : `${names.length} người chơi.`
  return <>
    <main className="content"><section className="card flex flex-col gap-3 p-4"><p className="field-label">Tên người chơi</p>
      <ul className="flex flex-col gap-2">{players.map((name, index) => <li key={index} className="flex gap-2"><input value={name} onChange={(event) => setPlayers((current) => current.map((item, i) => i === index ? event.target.value : item))} type="text" maxLength={12} autoComplete="off" autoCapitalize="words" spellCheck={false} placeholder={`Người chơi ${index + 1}`} aria-label={`Tên người chơi ${index + 1}`} className="sam-input" />{players.length > 2 && <button className="icon-btn" aria-label="Bỏ người chơi này" onClick={() => setPlayers((current) => current.filter((_, i) => i !== index))}><X className="size-5" /></button>}</li>)}</ul>
      {players.length < 5 && <button className="btn-ghost" onClick={() => setPlayers((current) => current.length < 5 ? [...current, ''] : current)}><Plus className="size-4" />Thêm người chơi</button>}
      <p className={cx('text-sm', duplicate ? 't-error' : 't-sub')}>{hint}</p>
    </section></main>
    <footer className="footer"><button className="btn-primary w-full" disabled={!canCreate} onClick={() => { if (!canCreate) return; const id = addTable(names); navigate(`/tables/${id}/games/new`) }}>Tạo bàn</button></footer>
  </>
}

function TableDetailPage() {
  const { tableId = '' } = useParams()
  const table = useSamlogStore((state) => state.tables.find((item) => item.id === tableId))
  const { openGameSheet } = useShell()
  if (!table) return <Navigate to="/" replace />
  const totals = new Map(table.players.map((name) => [name, 0]))
  table.games.filter((game) => getBoardLength(game) > 0).forEach((game) => {
    game.rankings.forEach((ranking) => {
      const raw = ranking.reward.trim()
      const amount = Number(raw)
      if (raw && Number.isFinite(amount) && totals.has(ranking.name)) {
        totals.set(ranking.name, (totals.get(ranking.name) ?? 0) + amount)
      }
    })
  })
  const totalRewards = [...totals.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
  return <>
    <section className="shrink-0">
      <div className="flex gap-1.5">
        {totalRewards.map(({ name, total }, index) => {
          const display = rewardDisplay(String(total))
          return <div key={name} className={cx('flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border px-1 py-2', rankStyle(index))}>
            <span className="w-full truncate text-center text-xs font-semibold">{titleCase(name)}</span>
            <span className="text-xl font-bold tabular-nums">{display.text || '0'}</span>
          </div>
        })}
      </div>
    </section>
    <main className="content">
      {table.games.length === 0 && <div className="empty"><div className="icon-box"><Dices className="size-5" /></div><p className="empty-title">Chưa có ván nào</p><p className="empty-text">Bấm "Tạo ván mới" bên dưới để bắt đầu ghi điểm.</p></div>}
      {[...table.games].reverse().map((game) => <LongPressCard key={game.id} onLongPress={() => openGameSheet(table, game)}>
        <Link className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 text-left" to={`/tables/${table.id}/games/${game.id}`}>
          <span className="flex items-center gap-2"><span className="game-icon"><Dices className="size-3.5" /></span><span className="t-main line-clamp-1 text-sm font-semibold">{game.title}</span></span>
          <span className="flex w-full flex-col gap-1">{game.rankings.map((player, index) => <span key={`${player.name}-${index}`} className={cx('rank-row', rankStyle(index))}><span className="font-bold">#{index + 1}</span><span className="line-clamp-1 flex-1 font-medium capitalize">{player.name}</span><span className="tabular-nums font-semibold">{player.total}</span><span className={cx(rewardDisplay(player.reward).color, 'min-w-10 text-right tabular-nums font-semibold')}>{rewardDisplay(player.reward).text}</span></span>)}</span>
          <span className="t-sub flex w-full items-center justify-between text-xs"><span className="flex items-center gap-1"><BarChart2 className="size-3.5" />{getBoardLength(game)} vòng</span><span>{formatDate(game.createdAt)}</span></span>
        </Link>
      </LongPressCard>)}
    </main><footer className="footer"><Link className="btn-primary w-full" to={`/tables/${table.id}/games/new`}><Plus className="size-5" />Tạo ván mới</Link></footer>
  </>
}

function GameFormPage({ editing = false }: { editing?: boolean }) {
  const { tableId = '', gameId = '' } = useParams()
  const table = useSamlogStore((state) => state.tables.find((item) => item.id === tableId))
  const addGame = useSamlogStore((state) => state.addGame)
  const editGame = useSamlogStore((state) => state.editGame)
  const navigate = useNavigate()
  const game = table?.games.find((item) => item.id === gameId)
  const lastGame = table?.games[table.games.length - 1]
  const [title, setTitle] = useState(() => editing ? game?.title ?? '' : `Ván #${(table?.games.length ?? 0) + 1}`)
  const [rewards, setRewards] = useState<string[]>(() => editing ? [...(game?.rewards ?? [])] : (table?.players.map((_, index) => lastGame?.rewards[index] ?? '') ?? []))
  if (!table || (editing && !game)) return <Navigate to="/" replace />
  const fromPrevious = !editing && Boolean(lastGame && rewards.some((reward) => reward !== ''))
  return <>
    <main className="content"><section className="card flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2"><label className="field-label" htmlFor="game-title">Tên ván</label><input id="game-title" value={title} onChange={(event) => setTitle(event.target.value)} type="text" autoComplete="off" autoCapitalize="sentences" spellCheck={false} placeholder="Ví dụ: Ván #1" className="sam-input" /></div>
      <div className="flex flex-col gap-2"><div><p className="field-label">Thưởng/phạt theo thứ hạng</p>{!editing && fromPrevious && <p className="field-help">Đã điền sẵn từ ván trước, bạn có thể sửa.</p>}</div>
        <ol className="flex flex-col gap-2">{rewards.map((reward, index) => <li key={index} className="flex gap-2"><span className={cx('rank-badge', rankStyle(index))} aria-label={`Hạng ${index + 1}`}>#{index + 1}</span><input value={reward} onChange={(event) => setRewards((current) => current.map((item, i) => i === index ? event.target.value : item))} placeholder={rewardPlaceholder(index, rewards.length)} aria-label={`Thưởng/phạt hạng ${index + 1}`} autoComplete="off" autoCapitalize="sentences" spellCheck={false} type="text" className={cx('sam-input flex-1', rankStyle(index), rewardDisplay(reward).color)} /></li>)}</ol>
        <p className="field-help">Số dương (+100) là thưởng, số âm (-100) là phạt. Có thể nhập chữ như "Trả tiền nước" (không cộng vào tổng). Để trống nếu không cần.</p>
      </div>
    </section></main>
    <footer className="footer"><button className="btn-primary w-full" onClick={() => {
      if (editing && game) { editGame(table.id, game.id, title, rewards); navigate(`/tables/${table.id}/games/${game.id}`) }
      else { const id = addGame(table.id, title, rewards); if (id) navigate(`/tables/${table.id}/games/${id}`) }
    }}>{editing ? 'Lưu thay đổi' : 'Bắt đầu ván'}</button></footer>
  </>
}

function GameBoardPage() {
  const { tableId = '', gameId = '' } = useParams()
  const table = useSamlogStore((state) => state.tables.find((item) => item.id === tableId))
  const game = table?.games.find((item) => item.id === gameId)
  const startRound = useSamlogStore((state) => state.startRound)
  const appendDigit = useSamlogStore((state) => state.appendDigit)
  const backspace = useSamlogStore((state) => state.backspace)
  const moveActivePlayer = useSamlogStore((state) => state.moveActivePlayer)
  const finishRound = useSamlogStore((state) => state.finishRound)
  const selectCell = useSamlogStore((state) => state.selectCell)
  const activeCellRef = useRef<HTMLButtonElement | null>(null)
  const lastCellTap = useRef<{ row: number; column: number; time: number } | null>(null)
  useEffect(() => {
    if (!game) return
    if (game.activeCell.r >= 0 && game.activeCell.c >= 0) {
      activeCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [game?.activeCell.r, game?.activeCell.c, game?.board])

  if (!table || !game) return <Navigate to="/" replace />
  const roundCount = getBoardLength(game)
  const activeInfo = game.activeCell.r >= 0 ? { player: table.players[game.activeCell.r] ?? '', round: game.activeCell.c + 1 } : null
  const previous = game.activeCell.r >= 0 ? table.players[(game.activeCell.r - 1 + table.players.length) % table.players.length] : ''
  const next = game.activeCell.r >= 0 ? table.players[(game.activeCell.r + 1) % table.players.length] : ''
  const isLastPlayer = game.activeCell.r === table.players.length - 1
  const handleCellTap = (row: number, column: number) => {
    const now = Date.now()
    const previousTap = lastCellTap.current
    if (previousTap && previousTap.row === row && previousTap.column === column && now - previousTap.time <= 450) {
      lastCellTap.current = null
      selectCell(table.id, game.id, row, column)
      return
    }
    lastCellTap.current = { row, column, time: now }
  }

  return <>
    <section className=""><div className="flex gap-1.5">{game.rankings.map((item, index) => <div key={`${item.name}-${index}`} className={cx('flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border px-1 py-2', rankStyle(index))}><span className="w-full truncate text-center text-xs font-semibold capitalize">{item.name}</span><span className="text-xl font-bold tabular-nums">{item.total}</span></div>)}</div></section>
    <hr className="board-divider" aria-hidden="true" />
    <section className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="sticky top-0 z-10 pb-1"><div className="flex gap-1.5">{table.players.map((player, row) => <span key={player} className={cx('player-header-cell flex h-11 min-w-0 flex-1 items-center justify-center truncate rounded-lg px-1 text-xs font-semibold capitalize', game.activeCell.r === row ? 'player-header-active t-primary' : 't-sub')}>{player}</span>)}</div></div>
      {roundCount === 0 && <div className="empty py-10"><p className="empty-title">Chưa có vòng nào</p><p className="empty-text">Bấm "Nhập điểm" bên dưới để bắt đầu. <br/> Chạm vào một ô điểm bất kỳ để sửa.</p></div>}
      {Array.from({ length: roundCount }, (_, index) => roundCount - 1 - index).map((column) => <div key={column} className="mt-1.5 flex items-center gap-1.5">{table.players.map((player, row) => {
        const active = game.activeCell.r === row && game.activeCell.c === column
        return <button key={player} ref={active ? activeCellRef : undefined} className={cx('score-cell cell-bg', active && 'active-cell')} aria-label={`${player}, vòng ${column + 1}: ${game.board[row]?.[column] ?? 0} điểm; chạm hai lần để sửa`} onClick={() => handleCellTap(row, column)}><span className={cx('text-sm font-semibold tabular-nums', scoreColor(game.board[row]?.[column] ?? 0))}>{game.board[row]?.[column] ?? 0}</span></button>
      })}</div>)}
    </section>
    {game.showKeyboard ? <footer className="keyboard-panel raised-keyboard">
      {activeInfo && <div className="flex items-center justify-between px-1"><p className="text-sm"><span className="t-sub">Vòng {activeInfo.round} · đang nhập cho</span><strong className="t-primary ml-1 uppercase">{titleCase(activeInfo.player)}</strong></p><button className="icon-btn" aria-label="Đóng bàn phím" title="Đóng bàn phím" onClick={() => finishRound(table.id, game.id)}><X className="size-5" /></button></div>}
      <div className="grid grid-cols-5 gap-2 keypad-grid">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => <button key={number} className="key-btn key-digit" onClick={() => appendDigit(table.id, game.id, number)}>{number}</button>)}
        <button className="key-btn key-nav col-span-2" aria-label={`Nhập cho ${previous}`} onClick={() => moveActivePlayer(table.id, game.id, -1)}><ChevronLeft className="size-4 shrink-0" /><span className="flex-1 truncate text-sm font-semibold capitalize">{previous}</span></button>
        {isLastPlayer
          ? <button className="key-btn key-finish col-span-2" onClick={() => finishRound(table.id, game.id)}><span className="flex-1 text-sm font-bold">Xong</span><Check className="size-4 shrink-0" /></button>
          : <button className="key-btn key-nav col-span-2" aria-label={`Nhập cho ${next}`} onClick={() => moveActivePlayer(table.id, game.id, 1)}><span className="flex-1 truncate text-sm font-semibold capitalize">{next}</span><ChevronRight className="size-4 shrink-0" /></button>}
        <button className="key-btn key-delete" aria-label="Xóa một chữ số" onClick={() => backspace(table.id, game.id)}><Delete className="size-5" /></button>
      </div>
    </footer> : <footer className="footer"><button className="btn-primary w-full" onClick={() => startRound(table.id, game.id)}><Plus className="size-5" />Nhập điểm</button></footer>}
  </>
}

function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route index element={<HomePage />} />
      <Route path="tables/new" element={<NewTablePage />} />
      <Route path="tables/:tableId" element={<TableDetailPage />} />
      <Route path="tables/:tableId/games/new" element={<GameFormPage />} />
      <Route path="tables/:tableId/games/:gameId" element={<GameBoardPage />} />
      <Route path="tables/:tableId/games/:gameId/edit" element={<GameFormPage editing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}

export default App
