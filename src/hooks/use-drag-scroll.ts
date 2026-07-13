import { useRef, useCallback, useEffect } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const dragged = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (!ref.current) return;
    
    isDragging.current = true;
    dragged.current = false;
    startY.current = e.clientY;
    scrollTop.current = ref.current.scrollTop;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    // We delay resetting dragged so the click event that fires right after pointerup is caught
    setTimeout(() => {
      dragged.current = false;
    }, 50);
  }, []);

  const onPointerLeave = useCallback(() => {
    isDragging.current = false;
    dragged.current = false;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !ref.current) return;
    
    const y = e.clientY;
    const walk = y - startY.current;
    
    if (Math.abs(walk) > 5) {
      dragged.current = true;
      ref.current.scrollTop = scrollTop.current - walk;
    }
  }, []);

  useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      if (dragged.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const el = ref.current;
    if (el) {
      el.addEventListener("click", handleCaptureClick, { capture: true });
      return () => {
        el.removeEventListener("click", handleCaptureClick, { capture: true });
      };
    }
  }, []);

  return {
    ref,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerMove,
  };
}
