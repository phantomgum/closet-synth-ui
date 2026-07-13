import { useRef, useCallback } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary pointer (left click or touch)
    if (e.button !== 0) return;
    if (!ref.current) return;
    
    isDragging.current = true;
    try {
      ref.current.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore capture errors
    }
    
    startY.current = e.clientY;
    scrollTop.current = ref.current.scrollTop;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!ref.current) return;
    isDragging.current = false;
    try {
      ref.current.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore capture errors
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !ref.current) return;
    
    const y = e.clientY;
    const walk = y - startY.current;
    ref.current.scrollTop = scrollTop.current - walk;
  }, []);

  return {
    ref,
    onPointerDown,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerMove,
  };
}
