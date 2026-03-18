import {
  CopyIcon,
  DicesIcon,
  ListTreeIcon,
  SquarePenIcon,
  Trash2Icon,
} from 'lucide-react';
import { Item, ItemDescription, ItemTitle } from '@/components/ui/item';
import useSwipeAction from '@/hooks/useSwipeAction';
import { Link, useNavigate } from 'react-router';
import { Separator } from '../../components/ui/separator';
import { cn } from '@/lib/utils';
import { getMoneyColor, getRankColor } from '@/utils/getColor';
import { deleteGame } from '@/lib/database';

/**
 * GameItem - Component hiển thị thông tin một ván chơi
 * Hỗ trợ swipe để hiện actions: Copy, Edit, Delete
 * Hiển thị danh sách người chơi, điểm số, tiền thắng/thua
 */
export default function GameItem({
  tableId,
  index,
  showSwipeHint,
  name,
  ranks,
  totalRounds,
  createdAt,
  onDelete,
}) {
  // Hook xử lý swipe actions (2 nút trái, 1 nút phải)
  const { rowRef, width, swipeHandlers } = useSwipeAction({
    right: 1,
    left: 2,
  });

  return (
    <div>
      <div className='relative overflow-hidden rounded-xl'>
        {/* === Layer actions (ẩn phía sau, hiện khi swipe) === */}
        <div className='absolute inset-0 flex'>
          {/* Nút Copy (trái) */}
          <Link
            to={`/tables/${tableId}/games/${index}/action/copy`}
            className='flex h-full items-center justify-center rounded-lg bg-blue-500/90'
            style={{ width: `${width}%` }}
          >
            <CopyIcon className='size-5 text-white' />
          </Link>

          {/* Nút Edit (trái) */}
          <Link
            to={`/tables/${tableId}/games/${index}/action/update`}
            className='flex h-full items-center justify-center rounded-lg bg-amber-400/90'
            style={{ width: `${width}%` }}
          >
            <SquarePenIcon className='size-5 text-white' />
          </Link>

          {/* Nút Delete (phải) */}
          <button
            className='ml-auto flex h-full items-center justify-center rounded-lg bg-red-500/90'
            style={{ width: `${width}%` }}
            onClick={() => onDelete(index, name)}
          >
            <Trash2Icon className='size-5 text-white' />
          </button>
        </div>

        {/* === Item chính (có thể swipe) === */}
        <Item
          variant='outline'
          className={cn(
            'bg-background relative rounded-xl border shadow-sm transition-transform',
            showSwipeHint && 'swipe-hint-anim',
          )}
          asChild
          ref={rowRef}
          {...swipeHandlers}
        >
          <Link to={`/tables/${tableId}/games/${index}`}>
            <div className='w-full space-y-3 p-3'>
              {/* Tiêu đề ván chơi */}
              <ItemTitle className='flex items-center gap-2 text-sm font-semibold'>
                <div className='bg-muted rounded-md p-1.5'>
                  <DicesIcon className='size-4' />
                </div>
                <span className='truncate'>{name}</span>
              </ItemTitle>

              {/* Danh sách người chơi */}
              <div className='space-y-1 text-sm'>
                {ranks.map((rank, i) => (
                  <div
                    key={i}
                    className={cn(
                      'grid grid-cols-[30px_1fr_30px_2fr] items-center rounded-md px-2 py-1.5',
                      getRankColor(i),
                    )}
                  >
                    {/* Thứ hạng */}
                    <span className='text-[11px] opacity-60'>#{i + 1}</span>

                    {/* Tên người chơi */}
                    <span className='truncate font-medium'>{rank.name}</span>

                    {/* Điểm số */}
                    <span className='text-right text-xs tabular-nums opacity-70'>
                      {rank.score}
                    </span>

                    {/* Tiền thắng/thua (màu xanh/đỏ) */}
                    <span
                      className={cn(
                        'text-right font-semibold tabular-nums',
                        getMoneyColor(rank.money),
                      )}
                    >
                      {rank.money}
                    </span>
                  </div>
                ))}
              </div>

              {/* Đường phân cách */}
              <Separator className='opacity-60' />

              {/* Footer: Số vòng và thời gian */}
              <ItemDescription className='text-muted-foreground flex items-center justify-between text-xs'>
                <span className='flex items-center gap-1'>
                  <ListTreeIcon className='size-4' />
                  {totalRounds} vòng
                </span>

                <span>{createdAt}</span>
              </ItemDescription>
            </div>
          </Link>
        </Item>
      </div>
    </div>
  );
}
