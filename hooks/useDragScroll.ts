import { useRef } from 'react';

// Adds click-and-drag horizontal scrolling on desktop (mobile uses native touch scroll)
export function useDragScroll() {
  const ref       = useRef<HTMLDivElement>(null);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    dragging.current  = true;
    startX.current    = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };

  const onMouseUp = () => {
    dragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = '';
      ref.current.style.userSelect = '';
    }
  };

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp,
  };
}
