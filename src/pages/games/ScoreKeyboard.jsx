import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreKeyboard({
  users,
  activeCell,
  displayValue,
  isPositive,
  onSetPositive,
  onSetNegative,
  onKeyPress,
  onBackspace,
  onPrev,
  onNext,
  onDone,
  onClose,
  hidden = false,
}) {
  const isLast = activeCell?.colIndex === users.length - 1;

  return (
    <div hidden={hidden} className='mb-10 flex w-full flex-col gap-3'>
      {/* Top bar: dấu +/-, tên người chơi, giá trị, nút đóng */}
      <div className='flex items-center gap-3'>
        <Button
          className={cn(
            'size-12 text-2xl',
            isPositive && 'bg-primary text-primary-foreground shadow',
          )}
          variant='secondary'
          size='icon'
          onClick={onSetPositive}
        >
          +
        </Button>

        <Button
          className={cn(
            'size-12 text-2xl',
            !isPositive && 'bg-destructive text-destructive-foreground shadow',
          )}
          variant='secondary'
          size='icon'
          onClick={onSetNegative}
        >
          −
        </Button>

        <span className='truncate text-lg font-bold uppercase'>
          {users[activeCell?.colIndex]}
        </span>

        <span className='text-primary flex-1 text-end text-xl font-bold tabular-nums'>
          {displayValue}
        </span>

        <Button
          className='size-12 shadow'
          variant='secondary'
          size='icon'
          onClick={onClose}
        >
          <ChevronDownIcon className='size-5' />
        </Button>
      </div>

      {/* Numpad */}
      <div className='grid grid-cols-5 gap-3'>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onKeyPress(num)}
            className='aspect-square h-14 w-full text-2xl shadow'
            variant='secondary'
            size='icon'
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Nav: prev / next|done / backspace */}
      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          className='h-12 flex-1 text-sm shadow'
          onClick={onPrev}
        >
          <ChevronLeftIcon className='size-5' />
          <span className='flex-1 truncate'>
            {
              users[
                activeCell?.colIndex === 0
                  ? users.length - 1
                  : activeCell?.colIndex - 1
              ]
            }
          </span>
        </Button>

        {isLast ? (
          <Button
            onClick={onDone}
            className='h-12 flex-1 border border-green-500 bg-green-500/20 text-sm text-green-700 shadow'
          >
            <span className='flex-1'>Xong</span>
            <CheckIcon className='size-5' />
          </Button>
        ) : (
          <Button
            variant='outline'
            className='h-12 flex-1 text-sm shadow'
            onClick={onNext}
          >
            <span className='flex-1 truncate'>
              {users[activeCell?.colIndex + 1]}
            </span>
            <ChevronRightIcon className='size-5' />
          </Button>
        )}

        <Button
          variant='destructive'
          size='icon'
          className='size-12 shadow'
          onClick={onBackspace}
        >
          <DeleteIcon className='size-5' />
        </Button>
      </div>
    </div>
  );
}
