import FooterAction from '@/components/FooterAction';
import { getGameDetail, updateGameScoresAndRanks } from '@/lib/database';
import { getRankColor } from '@/utils/getColor';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ScoreTable from './ScoreTable';
import ScoreKeyboard from './ScoreKeyboard';
import { motion } from 'framer-motion';

export default function GameDetail() {
  const { tableId, gameId } = useParams();
  const {
    users,
    name,
    scores: initialScores,
    createdAt,
  } = getGameDetail(tableId, gameId);

  const [scores, setScores] = useState(initialScores);
  const [activeCell, setActiveCell] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [isPositive, setIsPositive] = useState(true);

  const isKeyboardOpen = activeCell !== null;

  const totals = users.map((_, ci) =>
    scores.reduce((sum, row) => sum + (row[ci] ?? 0), 0),
  );

  const rankedPlayers = users
    .map((user, index) => ({ name: user, index, total: totals[index] }))
    .sort((a, b) => a.total - b.total);

  const displayValue =
    (!isPositive && inputVal !== '' ? '-' : '') + (inputVal || '0');

  const openCell = (rowIndex, colIndex) => {
    const currentVal = scores[rowIndex]?.[colIndex] ?? 0;
    setIsPositive(currentVal >= 0);
    setInputVal(currentVal === 0 ? '' : Math.abs(currentVal).toString());
    setActiveCell({ rowIndex, colIndex });
  };

  const commitValue = (rowIndex, colIndex) => {
    const num = parseInt(inputVal || '0', 10);
    const value = isPositive ? num : -num;
    setScores((prev) =>
      prev.map((r, ri) =>
        ri === rowIndex ? r.map((v, ci) => (ci === colIndex ? value : v)) : r,
      ),
    );
  };

  const cleanupEmptyRow = (rowIndex) => {
    setScores((prev) => {
      const row = prev[rowIndex];
      if (!row) return prev;
      if (row.every((v) => v === 0))
        return prev.filter((_, i) => i !== rowIndex);
      return prev;
    });
  };

  const closeKeyboard = (rowIndex) => {
    setActiveCell(null);
    setInputVal('');
    setTimeout(() => cleanupEmptyRow(rowIndex), 0);
  };

  const handleAddRow = () => {
    const newRow = users.map(() => 0);
    setScores((prev) => [newRow, ...prev]);
    setIsPositive(true);
    setInputVal('');
    setActiveCell({ rowIndex: 0, colIndex: 0 });
  };

  const handleClose = () => {
    if (!activeCell) return;
    commitValue(activeCell.rowIndex, activeCell.colIndex);
    closeKeyboard(activeCell.rowIndex);
  };

  const handlePrev = () => {
    if (!activeCell) return;
    commitValue(activeCell.rowIndex, activeCell.colIndex);
    const nextCol =
      activeCell.colIndex === 0 ? users.length - 1 : activeCell.colIndex - 1;
    openCell(activeCell.rowIndex, nextCol);
  };

  const handleNext = () => {
    if (!activeCell) return;
    commitValue(activeCell.rowIndex, activeCell.colIndex);
    const nextCol = activeCell.colIndex + 1;
    if (nextCol < users.length) openCell(activeCell.rowIndex, nextCol);
  };

  const handleDone = () => {
    if (!activeCell) return;
    commitValue(activeCell.rowIndex, activeCell.colIndex);
    closeKeyboard(activeCell.rowIndex);
  };

  const handleKeyPress = (key) => {
    setInputVal((prev) => (prev.length >= 5 ? prev : prev + key.toString()));
  };

  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    let totalScores = rankedPlayers.reduce((acc, player) => {
      acc[player.index] = player.total;
      return acc;
    }, {});

    totalScores = users.map((_, index) => totalScores[index]);

    const ranks = rankedPlayers.map((player) => player.index);

    updateGameScoresAndRanks(tableId, gameId, scores, ranks, totalScores);
  }, [scores]);

  return (
    <div className='flex h-full flex-col gap-5'>
      {/* Header */}
      <div className='text-muted-foreground flex items-center justify-between text-sm'>
        <h1 className='text-foreground font-semibold'>{name}</h1>
        <p className='text-xs'>{createdAt}</p>
      </div>

      {/* Score bar */}
      <motion.ul
        layout
        initial='hidden'
        animate='show'
        variants={{
          hidden: { opacity: 0, y: 10 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.25,
              staggerChildren: 0.06,
            },
          },
        }}
        className='flex gap-1.5'
      >
        {rankedPlayers.map(
          ({ name: playerName, index: playerIndex }, rankPos) => (
            <motion.li
              layout
              key={playerIndex}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className={cn(
                'flex flex-1 flex-col rounded-lg px-2 py-1.5 text-center text-sm shadow',
                getRankColor(rankPos),
              )}
            >
              <span className='truncate'>{playerName}</span>

              <motion.span
                key={totals[playerIndex]}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className='font-semibold tabular-nums'
              >
                {totals[playerIndex]}
              </motion.span>
            </motion.li>
          ),
        )}
      </motion.ul>

      {/* Bảng điểm */}
      <ScoreTable
        users={users}
        scores={scores}
        activeCell={activeCell}
        displayValue={displayValue}
        onCellClick={openCell}
      />

      <ScoreKeyboard
        users={users}
        activeCell={activeCell}
        displayValue={displayValue}
        isPositive={isPositive}
        onSetPositive={() => setIsPositive(true)}
        onSetNegative={() => setIsPositive(false)}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onPrev={handlePrev}
        onNext={handleNext}
        onDone={handleDone}
        onClose={handleClose}
        hidden={!isKeyboardOpen}
      />

      <FooterAction
        title='Thua thì nhập đi'
        onClick={handleAddRow}
        hidden={isKeyboardOpen}
      />
    </div>
  );
}
