import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

export default function FooterAction({
  title,
  onClick,
  disabled = false,
  hidden = false,

  // NEW
  showBack = true,
  showNext = true,
  nextPath = null,
}) {
  const navigate = useNavigate();

  return (
    <motion.footer
      hidden={hidden}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 14,
      }}
      className='fixed right-0 bottom-0 left-0 z-50 px-4 pb-4'
    >
      <div className='bg-muted/70 flex items-center gap-3 rounded-2xl p-2 shadow-lg backdrop-blur-md'>
        {/* === BACK === */}
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className='bg-background/60 flex h-11 w-11 items-center justify-center rounded-xl'
          >
            <ArrowLeftIcon className='size-5' />
          </motion.button>
        )}

        {/* === MAIN ACTION === */}
        <motion.div whileTap={{ scale: 0.97 }} className='flex-1'>
          <Button
            disabled={disabled}
            onClick={onClick}
            className='flex h-12 w-full items-center justify-center font-bold shadow'
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className='ml-2'
            >
              {title}
            </motion.span>
          </Button>
        </motion.div>

        {/* === NEXT === */}
        {showNext && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (nextPath) navigate(nextPath);
              else navigate(1);
            }}
            className='bg-background/60 flex h-11 w-11 items-center justify-center rounded-xl'
          >
            <ArrowRightIcon className='size-5' />
          </motion.button>
        )}
      </div>
    </motion.footer>
  );
}
