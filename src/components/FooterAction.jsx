import { PlusIcon } from 'lucide-react';
import { Button } from './ui/button';

/**
 * FooterAction - Nút hành động cố định ở cuối màn hình
 * @param {string} title - Nội dung hiển thị trên nút
 * @param {function} onClick - Hàm xử lý khi click nút
 * @param {boolean} disabled - Trạng thái vô hiệu hóa nút
 */
export default function FooterAction({ title, onClick, disabled = false }) {
  return (
    // Footer cố định ở bottom với nền mờ
    <footer className='bg-muted/50 fixed right-0 bottom-0 left-0 flex h-(--footer-height) items-center justify-center px-5 backdrop-blur-sm'>
      {/* Nút chính full width */}
      <Button
        disabled={disabled}
        className='h-12 w-full font-bold shadow'
        onClick={onClick}
      >
        <PlusIcon className='size-6' /> {title}
      </Button>
    </footer>
  );
}
