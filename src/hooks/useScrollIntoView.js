import { useEffect, useRef } from 'react';

/**
 * Hook tự động scroll phần tử vào tầm nhìn khi key thay đổi.
 * @returns ref callback để gắn vào phần tử cần scroll
 */
export function useScrollIntoView(
  key,
  options = { behavior: 'smooth', block: 'center', inline: 'center' },
) {
  const refs = useRef({});

  useEffect(() => {
    if (key === null || key === undefined) return;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        refs.current[key]?.scrollIntoView(options);
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [key]);

  const setRef = (refKey) => (el) => {
    refs.current[refKey] = el;
  };

  return setRef;
}
