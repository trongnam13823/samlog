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

/**
 * GameList - Trang danh sách các ván chơi
 * Hiển thị tổng điểm tất cả người chơi và danh sách ván
 *
 * Chức năng:
 * - Hiển thị tổng tiền của người chơi
 * - Danh sách các ván chơi
 * - Nút thêm ván mới
 */
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
      {/* === Summary bar: Tổng tiền các người chơi === */}
      <div className='bg-background/80 sticky top-0 z-10 flex rounded-lg border px-2 py-1 shadow backdrop-blur-md'>
        {data.totalMoney.map((item) => (
          <div
            key={item.name}
            className='flex flex-1 flex-col items-center py-1.5'
          >
            {/* Tên người chơi */}
            <span className='text-primary truncate text-xs font-medium'>
              {item.name}
            </span>

            {/* Tổng tiền (màu theo thắng/thua) */}
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                getMoneyColor(item.money),
              )}
            >
              {item.money}
            </span>
          </div>
        ))}
      </div>

      {/* === List: Danh sách các ván chơi === */}
      <ItemGroup className='gap-5'>
        {data.games.length > 0 ? (
          data.games
            .map((game, index) => (
              <GameItem
                key={game.createdAt}
                tableId={tableId}
                showSwipeHint={showSwipeHint && index === data.games.length - 1}
                index={index}
                {...game}
                onDelete={handleDelete}
              />
            ))
            .reverse()
        ) : (
          <div className='text-muted-foreground fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
            Không có ván nào
          </div>
        )}
      </ItemGroup>

      {/* === Footer: Nút thêm ván mới === */}
      <FooterAction
        title='Thêm bát thêm đũa'
        onClick={() => navigate(`/tables/${tableId}/games/-1/action/create`)}
      />
    </>
  );
}
