/**
 * getRankColor - Trả về style CSS theo thứ hạng
 * @param {number} i - Vị trí xếp hạng (0-based)
 * @returns {string} - Chuỗi className tương ứng
 */
export const getRankColor = (i) => {
  // 🥇 TOP 1 (gold → red + glow)
  if (i === 0) return `bg-yellow-500/10 text-yellow-600/90 font-semibold`;

  // 🥈🥉 top tiếp
  if (i === 1) return `bg-blue-500/10 text-blue-600/90 font-semibold`;

  if (i === 2) return `bg-emerald-500/10 text-emerald-600/90 font-medium`;

  // 🔻 gần cuối (hồng)
  if (i === 3) return `bg-pink-500/10 text-pink-600/90 font-medium`;

  // 🔻 cuối bảng (đỏ)
  if (i === 4) return `bg-red-500/10 text-red-600/90 font-medium`;

  return 'bg-muted/30 text-muted-foreground';
};

/**
 * getScoreColor - Trả về màu chữ CSS theo điểm số
 * Ánh xạ điểm số sang màu của các rank
 * @param {number} score - Điểm số (1-99)
 * @returns {string} - className màu chữ
 */
export const getScoreColor = (score) => {
  // Nhỏ hơn 1 → rank 0 (vàng)
  if (score < 1) return 'text-yellow-600/90 font-semibold';

  // 1-3 → rank 1 (xanh dương)
  if (score >= 1 && score <= 3) return 'text-blue-600/90 font-semibold';

  // 4-6 → rank 2 (xanh lá)
  if (score >= 4 && score <= 6) return 'text-emerald-600/90 font-medium';

  // 7-9 → rank 3 (hồng)
  if (score >= 7 && score <= 9) return 'text-pink-600/90 font-medium';

  // Lớn hơn 9 → rank 4 (đỏ)
  return 'text-red-600/90 font-medium';
};

/**
 * getMoneyColor - Xác định màu sắc cho số tiền
 * Dựa trên dấu (+ thắng, - thua)
 * @param {number} money - Số tiền (VD: 100 hoặc -50)
 * @returns {string} - className màu sắc
 */
export const getMoneyColor = (money) => {
  if (money > 0) return 'text-green-500 font-bold tabular-nums';
  if (money < 0) return 'text-red-500 font-bold tabular-nums';
  return 'text-muted-foreground text-xs font-normal';
};
