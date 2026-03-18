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
import { motion } from 'framer-motion';

export default function TableItem({
  index,
  createdAt,
  name,
  showSwipeHint,
  totalGames,
  totalRounds,
  onDelete,
}) {
  const { rowRef, width, swipeHandlers } = useSwipeAction({
    right: 1,
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
      className='space-y-1'
    >
      {/* Time */}
      <p className='text-muted-foreground px-1 text-xs'>{createdAt}</p>

      <div className='relative rounded-lg'>
        {/* === ACTION LAYER === */}
        <div className='absolute inset-0 flex'>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: width > 0 ? 1 : 0 }}
            className='ml-auto flex items-center justify-center rounded-lg bg-red-500/90 backdrop-blur-sm'
            style={{ width: `${width}%` }}
            onClick={() => onDelete(index, name)}
          >
            <Trash2Icon className='size-5 text-white' />
          </motion.button>
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
            <Link to={`/tables/${index}/games`}>
              <div className='flex gap-3 p-3'>
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ItemMedia
                    variant='icon'
                    className='bg-muted my-auto rounded-lg p-2'
                  >
                    <UsersIcon className='text-foreground size-5' />
                  </ItemMedia>
                </motion.div>

                {/* Content */}
                <ItemContent className='min-w-0 flex-1'>
                  <ItemTitle className='truncate text-sm font-semibold'>
                    {name}
                  </ItemTitle>

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
        </motion.div>
      </div>
    </motion.div>
  );
}
