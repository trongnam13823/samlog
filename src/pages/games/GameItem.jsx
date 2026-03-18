import {
  CopyIcon,
  DicesIcon,
  ListTreeIcon,
  SquarePenIcon,
  Trash2Icon,
} from 'lucide-react';
import { Item, ItemDescription, ItemTitle } from '@/components/ui/item';
import useSwipeAction from '@/hooks/useSwipeAction';
import { Link } from 'react-router';
import { Separator } from '../../components/ui/separator';
import { cn } from '@/lib/utils';
import { getMoneyColor, getRankColor } from '@/utils/getColor';
import { motion } from 'framer-motion';

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
  const { rowRef, width, swipeHandlers } = useSwipeAction({
    right: 1,
    left: 2,
  });

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 120,
            damping: 14,
          },
        },
      }}
    >
      <div className='relative rounded-lg'>
        {/* === ACTIONS === */}
        <div className='absolute inset-0 flex'>
          <Link
            to={`/tables/${tableId}/games/${index}/action/copy`}
            className='flex items-center justify-center rounded-lg bg-blue-500/90'
            style={{ width: `${width}%` }}
          >
            <CopyIcon className='size-5 text-white' />
          </Link>

          <Link
            to={`/tables/${tableId}/games/${index}/action/update`}
            className='flex items-center justify-center rounded-lg bg-amber-400/90'
            style={{ width: `${width}%` }}
          >
            <SquarePenIcon className='size-5 text-white' />
          </Link>

          <button
            className='ml-auto flex items-center justify-center rounded-lg bg-red-500/90'
            style={{ width: `${width}%` }}
            onClick={() => onDelete(index, name)}
          >
            <Trash2Icon className='size-5 text-white' />
          </button>
        </div>

        {/* === CONTENT === */}
        <motion.div>
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
            <Link to={`/tables/${tableId}/games/${index}`}>
              <div className='w-full space-y-3 p-3'>
                {/* TITLE */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ItemTitle className='flex items-center gap-2 text-sm font-semibold'>
                    <div className='bg-muted rounded-md p-1.5'>
                      <DicesIcon className='size-4' />
                    </div>
                    <span className='truncate'>{name}</span>
                  </ItemTitle>
                </motion.div>

                {/* RANKS */}
                <div className='space-y-1 text-sm'>
                  {ranks.map((rank, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        'grid grid-cols-[30px_1fr_30px_2fr] items-center rounded-md px-2 py-1.5',
                        getRankColor(i),
                      )}
                    >
                      <span className='text-[11px] opacity-60'>#{i + 1}</span>

                      <span className='truncate font-medium'>{rank.name}</span>

                      <span className='text-right text-xs tabular-nums opacity-70'>
                        {rank.score}
                      </span>

                      <span
                        className={cn(
                          'text-right font-semibold tabular-nums',
                          getMoneyColor(rank.money),
                        )}
                      >
                        {rank.money}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <Separator className='opacity-60' />

                {/* FOOTER */}
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
        </motion.div>
      </div>
    </motion.div>
  );
}
