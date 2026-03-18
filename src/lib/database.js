const DB_NAME = 'samlog';
const SWIPE_HINT_COUNT_KEY = 'swipeHintCount';

const initialData = [
  {
    users: ['Nam', 'Tuấn', 'Hưng', 'Dũng', 'Quang'],
    games: [
      {
        name: 'Chơi xong rồi tính',
        rewards: ['+100', '+50', '-0', '-50', '-100'],
        scores: [
          [4, 7, 5, 0, 2],
          [9, 8, 8, 0, 8],
          [4, 0, 8, 9, 9],
          [3, 8, 0, 9, 7],
          [1, 8, 9, 0, 8],
        ],
        ranks: [3, 0, 2, 1, 4],
        createdAt: '2026-03-18T08:57:49.864Z',
        totalScores: [21, 31, 30, 18, 34],
      },
      {
        name: 'Gỡ lần 1',
        rewards: ['+200', '+100', '-50', '-100', '-150'],
        scores: [
          [24, 1, 2, 15, 1],
          [9, 8, 0, 9, 8],
          [9, 8, 4, 0, 9],
          [9, 8, 8, 9, 0],
          [24, 8, 9, 0, 9],
          [9, 9, 8, 9, 0],
          [4, 8, 9, 0, 7],
          [2, 0, 4, 7, 6],
          [2, 5, 8, 0, 7],
          [8, 4, 0, 7, 3],
        ],
        ranks: [4, 2, 3, 1, 0],
        createdAt: '2026-03-18T08:59:08.597Z',
        totalScores: [100, 59, 52, 56, 50],
      },
      {
        name: 'Gỡ lần 2',
        rewards: ['+200', '+100', '-50', '-100', '-150'],
        scores: [
          [9, 15, 7, 0, 6],
          [9, 9, 9, 0, 7],
          [3, 0, 4, 9, 7],
          [1, 5, 0, 7, 8],
          [2, 3, 0, 8, 7],
          [2, 7, 6, 0, 5],
          [8, 8, 4, 9, 0],
        ],
        ranks: [2, 3, 0, 4, 1],
        createdAt: '2026-03-18T09:02:55.695Z',
        totalScores: [34, 47, 30, 33, 40],
      },
      {
        name: 'Ăn đêm',
        rewards: ['', '', 'Trả tiền nước', 'Trả tiền ăn', 'Trả tiền ăn'],
        scores: [
          [4, 8, 0, 8, 7],
          [2, 3, 7, 0, 9],
          [8, 9, 8, 0, 9],
        ],
        ranks: [3, 0, 2, 1, 4],
        createdAt: '2026-03-18T09:05:14.436Z',
        totalScores: [14, 20, 15, 8, 25],
      },
    ],
    createdAt: '2026-03-18T08:57:09.972Z',
  },
];

export function getSwipeHintCount() {
  const data = localStorage.getItem(SWIPE_HINT_COUNT_KEY);
  return data ? JSON.parse(data) : { tableItem: 0, gameItem: 0 };
}

export function setSwipeHintCount(data) {
  localStorage.setItem(SWIPE_HINT_COUNT_KEY, JSON.stringify(data));
}

export function saveToStorage(data) {
  localStorage.setItem(DB_NAME, JSON.stringify(data));
}

export function loadFromStorage() {
  const data = localStorage.getItem(DB_NAME);

  if (data) {
    return JSON.parse(data);
  }

  saveToStorage(initialData);

  return initialData;
}

export function formatDate(date) {
  return new Date(date).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function formatReward(reward) {
  return reward > 0 ? `+${reward}` : `${reward}`;
}

export function calculateRanks(game, users) {
  const { ranks, rewards } = game;
  return ranks.map((userIndex, rewardIndex) => {
    const reward = rewards[rewardIndex];
    const isNumber = reward !== '' && !isNaN(Number(reward));

    return {
      name: users[userIndex],
      score: game.totalScores[userIndex],
      money: isNumber ? formatReward(Number(reward)) : reward,
    };
  });
}

export function calculateTotalMoney(users, games) {
  const result = users.map((name) => ({
    name,
    money: 0,
  }));

  games.forEach((game) => {
    const { ranks, rewards } = game;

    ranks.forEach((userIndex, rewardIndex) => {
      const reward = Number(rewards[rewardIndex]) || 0;
      result[userIndex].money += reward;
    });
  });

  return result
    .sort((a, b) => b.money - a.money)
    .map((item) => ({
      ...item,
      money: formatReward(item.money),
    }));
}

// --- API Functions ---

export function getTableUsers(index) {
  const data = loadFromStorage();
  return data[index].users;
}

export function getTableList() {
  const data = loadFromStorage();

  return data.map((table) => ({
    name: table.users.join(' · '),
    totalGames: table.games.length,
    totalRounds: table.games.reduce((acc, game) => acc + game.scores.length, 0),
    createdAt: formatDate(table.createdAt),
  }));
}

export function getGameList(index) {
  const data = loadFromStorage();

  const users = data[index].users;
  const games = data[index].games;

  return {
    totalMoney: calculateTotalMoney(users, games),
    games: games.map((game) => ({
      name: game.name,
      ranks: calculateRanks(game, users),
      totalRounds: game.scores.length,
      createdAt: formatDate(game.createdAt),
    })),
  };
}

export function getGameDetail(tableIndex, gameIndex) {
  const data = loadFromStorage();

  const users = data[tableIndex].users;
  const game = data[tableIndex].games[gameIndex];

  return {
    users,
    name: game.name,
    scores: game.scores,
    createdAt: formatDate(game.createdAt),
  };
}

export function getGameInfo(tableIndex, gameIndex) {
  const data = loadFromStorage();

  const game = data[tableIndex].games[gameIndex];

  return {
    name: game.name,
    rewards: game.rewards,
    createdAt: formatDate(game.createdAt),
  };
}

export function createTable(users) {
  const data = loadFromStorage();

  data.push({
    users,
    games: [],
    createdAt: new Date().toISOString(),
  });

  saveToStorage(data);

  return data.length - 1;
}

export function deleteTable(index) {
  const data = loadFromStorage();

  data.splice(index, 1);

  saveToStorage(data);

  return index;
}

export function createGame(tableIndex, name, rewards) {
  const data = loadFromStorage();

  data[tableIndex].games.push({
    name,
    rewards,
    scores: [],
    ranks: [],
    createdAt: new Date().toISOString(),
  });

  saveToStorage(data);

  return data[tableIndex].games.length - 1;
}

export function updateGameInfo(tableIndex, gameIndex, name, rewards) {
  const data = loadFromStorage();
  const game = data[tableIndex].games[gameIndex];

  game.name = name;
  game.rewards = rewards;

  saveToStorage(data);

  return gameIndex;
}

export function updateGameScoresAndRanks(
  tableIndex,
  gameIndex,
  scores,
  ranks,
  totalScores,
) {
  const data = loadFromStorage();
  const game = data[tableIndex].games[gameIndex];

  game.scores = scores;
  game.ranks = ranks;
  game.totalScores = totalScores;

  saveToStorage(data);

  return gameIndex;
}

export function deleteGame(tableIndex, gameIndex) {
  const data = loadFromStorage();
  data[tableIndex].games.splice(gameIndex, 1);
  saveToStorage(data);
  return gameIndex;
}
