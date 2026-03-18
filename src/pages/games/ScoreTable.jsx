import { cn } from '@/lib/utils';
import { getScoreColor } from '@/utils/getColor';
import { useRef } from 'react';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';
import { motion } from 'framer-motion';

export default function ScoreTable({
  users,
  scores,
  activeCell,
  displayValue,
  onCellClick,
}) {
  const tableWrapRef = useRef(null);
  const isKeyboardOpen = activeCell !== null;

  const activeCellKey =
    activeCell !== null
      ? `${activeCell.rowIndex}-${activeCell.colIndex}`
      : null;
  const setRef = useScrollIntoView(activeCellKey);

  return (
    <motion.div
      className='relative w-full flex-1'
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className='absolute inset-0'>
        <div
          ref={tableWrapRef}
          className='bg-background max-h-full overflow-auto rounded-lg border'
        >
          <table className='w-full table-fixed text-[15px]'>
            <thead>
              <tr className='bg-background sticky top-0 z-20 border-b'>
                {users.map((user, index) => (
                  <th
                    key={user}
                    className='px-2 py-2.5 text-center font-medium not-first:border-l'
                  >
                    <span
                      className={cn(
                        'truncate',
                        isKeyboardOpen &&
                          activeCell?.colIndex === index &&
                          'underline',
                      )}
                    >
                      {user}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td
                    colSpan={users.length}
                    className='text-muted-foreground p-4 text-center text-sm'
                  >
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                scores.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    className='not-first:border-t'
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: rowIndex * 0.03,
                      duration: 0.15,
                    }}
                  >
                    {row.map((val, colIndex) => {
                      const isActive =
                        activeCell?.rowIndex === rowIndex &&
                        activeCell?.colIndex === colIndex;

                      return (
                        <td
                          key={colIndex}
                          ref={setRef(`${rowIndex}-${colIndex}`)}
                          onClick={() => onCellClick(rowIndex, colIndex)}
                          className={cn(
                            'cursor-pointer px-2 py-3 text-center transition-colors not-first:border-l',
                            getScoreColor(val),
                            isActive &&
                              'text-primary bg-primary/10 rounded-md font-semibold',
                          )}
                        >
                          {isActive ? displayValue : val}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
