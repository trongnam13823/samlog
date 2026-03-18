import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Kết hợp clsx và tailwind-merge
 * Hỗ trợ điều kiện className và gộp Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
