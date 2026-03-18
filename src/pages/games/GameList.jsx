import FooterAction from '@/components/FooterAction';
import { ItemGroup } from '@/components/ui/item';
import { useNavigate, useParams } from 'react-router';
import GameItem from './GameItem';
import { getMoneyColor } from '@/utils/getColor';
import { cn } from '@/lib/utils';
import {
  deleteGame,
  getGameList,
  getSwipeHintCount,
  setSwipeHintCount,
} from '@/lib/database';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GameList() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [data, setData] = useState(() => getGameList(tableId));
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const handleDelete = (index, name) => {
    if (confirm(`Xóa ván chơi "${name}"?`)) {
      deleteGame(tableId, index);
      setData(getGameList(tableId));
    }
  };

  useEffect(() => {
    const data = getSwipeHintCount();
    const count = data.gameItem;
    if (count < 1) {
      setShowSwipeHint(true);
      setSwipeHintCount({
        ...data,
        gameItem: count + 1,
      });
    }
  }, []);

  return (
    <>
      {/* === Summary === */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className='bg-background/80 sticky top-0 z-10 flex rounded-lg border px-2 py-1 shadow backdrop-blur-md'
      >
        {data.totalMoney.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className='flex flex-1 flex-col items-center py-1.5'
          >
            <span className='text-primary truncate text-xs font-medium'>
              {item.name}
            </span>

            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                getMoneyColor(item.money),
              )}
            >
              {item.money}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* === List === */}
      <motion.div
        initial='hidden'
        animate='show'
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        <ItemGroup className='gap-5'>
          {data.games.length > 0 ? (
            data.games
              .map((game, index) => (
                <GameItem
                  key={game.createdAt}
                  tableId={tableId}
                  showSwipeHint={
                    showSwipeHint && index === data.games.length - 1
                  }
                  index={index}
                  {...game}
                  onDelete={handleDelete}
                />
              ))
              .reverse()
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-muted-foreground fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
            >
              Không có ván nào
            </motion.div>
          )}
        </ItemGroup>
      </motion.div>

      {/* === Footer === */}
      <FooterAction
        title='Thêm bát thêm đũa'
        onClick={() => navigate(`/tables/${tableId}/games/-1/action/create`)}
      />
    </>
  );
}
