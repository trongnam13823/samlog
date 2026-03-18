import { Link } from 'react-router';
import { SpadeIcon } from 'lucide-react';

/**
 * Header - Thanh tiêu đề cố định ở đầu màn hình
 * Hiển thị logo trang chủ dạng lá bài
 */
export default function Header() {
  return (
    // Link về trang chủ với header cố định ở top
    <Link to='/'>
      <header className='bg-muted/50 fixed top-0 right-0 left-0 z-10 flex h-(--header-height) items-center justify-center px-5 backdrop-blur-sm'>
        {/* Icon lá bài (Spade) làm logo */}
        <SpadeIcon className='fill-primary size-8' />
      </header>
    </Link>
  );
}
