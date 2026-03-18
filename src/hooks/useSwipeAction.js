import { useRef, useCallback, useState } from 'react';

/**
 * useSwipeAction - Custom hook xử lý vuốt (swipe) trên mobile
 * Hỗ trợ mở/đóng action buttons khi vuốt trái/phải
 *
 * @param {number} left - Số lượng nút bên trái
 * @param {number} right - Số lượng nút bên phải
 * @param {number} width - Phần trăm chiều rộng nút (mặc định 25%)
 * @param {function} onOpen - Callback khi mở
 * @param {function} onClose - Callback khi đóng
 */
export default function useSwipeAction({
  left = 0,
  right = 0,
  width = 25,
  onOpen,
  onClose,
} = {}) {
  // Refs cho DOM element và trạng thái kéo
  const rowRef = useRef(null);
  const [openSide, setOpenSide] = useState(null);

  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const isLocked = useRef(false);
  const swipeDir = useRef(null);
  const openSideRef = useRef(null);

  // Tính chiều rộng của item
  const getItemWidth = () => rowRef.current?.offsetWidth ?? 300;

  /**
   * Tính chiều rộng vuốt cho mỗi bên
   * @param {string} side - 'left' hoặc 'right'
   */
  const getWidth = useCallback(
    (side) => {
      const base = (getItemWidth() * width) / 100;
      const count = side === 'left' ? left : right;
      return base * count;
    },
    [left, right, width],
  );

  /**
   * Áp dụng transform CSS để di chuyển item
   * @param {number} x - Vị trí X
   * @param {boolean} animated - Có animation không
   */
  const setTransform = (x, animated = false) => {
    const el = rowRef.current;
    if (!el) return;
    el.style.transition = animated
      ? 'transform .25s cubic-bezier(.25,.46,.45,.94)'
      : 'none';
    el.style.transform = `translateX(${x}px)`;
  };

  /**
   * Mở action panel theo hướng chỉ định
   * @param {string} side - 'left' hoặc 'right'
   */
  const open = useCallback(
    (side) => {
      const w = getWidth(side);
      if (w === 0) return;
      setTransform(side === 'left' ? w : -w, true);
      openSideRef.current = side;
      setOpenSide(side);
      onOpen?.(side);
    },
    [getWidth, onOpen],
  );

  /**
   * Đóng action panel
   */
  const close = useCallback(() => {
    setTransform(0, true);
    openSideRef.current = null;
    setOpenSide(null);
    onClose?.();
  }, [onClose]);

  /**
   * Toggle mở/đóng action panel
   * @param {string} side - 'left' hoặc 'right'
   */
  const toggle = useCallback(
    (side) => {
      openSideRef.current === side ? close() : open(side);
    },
    [open, close],
  );

  /**
   * Xử lý khi bắt đầu chạm (touch start)
   */
  const onTouchStart = useCallback(
    (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;

      const side = openSideRef.current;
      currentX.current =
        side === 'left'
          ? getWidth('left')
          : side === 'right'
            ? -getWidth('right')
            : 0;

      isDragging.current = true;
      isLocked.current = false;
      swipeDir.current = null;
    },
    [getWidth],
  );

  /**
   * Xử lý khi di chuyển ngón tay (touch move)
   * Kiểm tra hướng vuốt và cập nhật vị trí
   */
  const onTouchMove = useCallback(
    (e) => {
      if (!isDragging.current) return;

      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      // Khóa hướng nếu vuốt ngang nhiều hơn dọc
      if (!isLocked.current) {
        if (Math.abs(dy) > Math.abs(dx)) {
          isDragging.current = false;
          return;
        }
        isLocked.current = true;
        swipeDir.current = dx < 0 ? 'left' : 'right';
      }

      const side = openSideRef.current;
      const wLeft = getWidth('left');
      const wRight = getWidth('right');

      // Tính toán vị trí tiếp theo dựa trên hướng vuốt
      let next;
      if (!side) {
        if (swipeDir.current === 'right' && wLeft > 0) {
          next = Math.max(0, Math.min(wLeft, dx));
        } else if (swipeDir.current === 'left' && wRight > 0) {
          next = Math.max(-wRight, Math.min(0, dx));
        } else return;
      } else if (side === 'left') {
        next = Math.max(0, Math.min(wLeft, wLeft + dx));
      } else {
        next = Math.max(-wRight, Math.min(0, -wRight + dx));
      }

      currentX.current = next;
      setTransform(next);
    },
    [getWidth],
  );

  /**
   * Xử lý khi kết thúc chạm (touch end)
   * Quyết định mở hoặc đóng dựa trên vị trí hiện tại
   */
  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const x = currentX.current;
    const thresholdLeft = getWidth('left') / 2;
    const thresholdRight = getWidth('right') / 2;

    // Mở nếu vượt ngưỡng, đóng nếu chưa đủ
    if (x > thresholdLeft) open('left');
    else if (x < -thresholdRight) open('right');
    else close();
  }, [getWidth, open, close]);

  // Trả về API của hook
  return {
    width,
    rowRef,
    openSide,
    isOpen: openSide !== null,
    open,
    close,
    toggle,
    swipeHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
