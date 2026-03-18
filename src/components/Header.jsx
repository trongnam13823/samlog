import { Link } from 'react-router';
import { SpadeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <Link to='/'>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 14,
        }}
        className='bg-muted/50 fixed top-0 right-0 left-0 z-10 flex h-(--header-height) items-center justify-center px-5 backdrop-blur-sm'
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className='flex items-center justify-center'
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            }}
          >
            <SpadeIcon className='fill-primary size-8' />
          </motion.div>
        </motion.div>
      </motion.header>
    </Link>
  );
}
