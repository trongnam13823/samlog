import { DicesIcon, ListTreeIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import useSwipeAction from '@/hooks/useSwipeAction';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

/**
 * TableItem - Component hiển thị thông tin một bàn chơi
 * Hỗ trợ swipe để hiện nút Delete
 * Hiển thị danh sách người chơi, số ván, số vòng
 */
export default function TableItem({
  index,
  createdAt,
  name,
  showSwipeHint,
  totalGames,
  totalRounds,
  onDelete,
}) {
  // Hook xử lý swipe (1 nút bên phải - Delete)
  const { rowRef, width, swipeHandlers } = useSwipeAction({
    right: 1,
  });

  return (
    <div className='space-y-1'>
      {/* Thời gian tạo bàn */}
      <p className='text-muted-foreground px-1 text-xs'>{createdAt}</p>

      <div className='relative rounded-lg'>
        {/* === Layer actions (ẩn phía sau, hiện khi swipe phải) === */}
        <div className='absolute inset-0 flex'>
          {/* Nút Delete */}
          <button
            className='ml-auto flex items-center justify-center rounded-lg bg-red-500/90 backdrop-blur-sm'
            style={{ width: `${width}%` }}
            onClick={() => onDelete(index, name)}
          >
            <Trash2Icon className='size-5 text-white' />
          </button>
        </div>

        {/* === Content: Thông tin bàn chơi === */}
        <Item
          variant='outline'
          className={cn(
            'bg-background relative rounded-lg border shadow transition-transform',
            showSwipeHint && 'swipe-hint-anim',
          )}
          asChild
          ref={rowRef}
          {...swipeHandlers}
        >
          <Link to={`/tables/${index}/games`}>
            <div className='flex gap-3 p-3'>
              {/* Icon đại diện */}
              <ItemMedia
                variant='icon'
                className='bg-muted my-auto rounded-lg p-2'
              >
                <UsersIcon className='text-foreground size-5' />
              </ItemMedia>

              {/* Thông tin chi tiết */}
              <ItemContent className='min-w-0 flex-1'>
                {/* Tên người chơi */}
                <ItemTitle className='truncate text-sm font-semibold'>
                  {name}
                </ItemTitle>

                {/* Meta: Số ván và vòng */}
                <ItemDescription className='mt-1 flex items-center gap-2 text-xs'>
                  <span className='flex items-center gap-1'>
                    <DicesIcon className='size-4' />
                    {totalGames} ván
                  </span>

                  <Separator orientation='vertical' asChild>
                    <span className='h-3' />
                  </Separator>

                  <span className='flex items-center gap-1'>
                    <ListTreeIcon className='size-4' />
                    {totalRounds} vòng
                  </span>
                </ItemDescription>
              </ItemContent>
            </div>
          </Link>
        </Item>
      </div>
    </div>
  );
}
