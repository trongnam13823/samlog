import { Link } from 'react-router';
import { SpadeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router';

export default function Header() {
  const { pathname } = useLocation();

  return (
    <motion.header
      key={pathname}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className='fixed top-0 right-0 left-0 z-50 flex h-(--header-height) items-center justify-center'
    >
      <Link to='/'>
        <motion.div
          whileTap={{ scale: 0.92 }}
          className='flex items-center justify-center'
        >
          <div className='border-border/50 bg-background/70 flex items-center gap-1.5 rounded-xl border px-3 py-1 shadow-sm backdrop-blur-md'>
            <motion.div
              initial={{ scale: 0.85, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 180,
                damping: 14,
              }}
              className='flex items-center gap-1.5'
            >
              <SpadeIcon className='fill-primary size-5' />
              <span className='text-xs font-semibold tracking-tight'>
                Samlog
              </span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.header>
  );
}
