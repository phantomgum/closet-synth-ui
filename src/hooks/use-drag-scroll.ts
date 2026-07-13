import { useRef, useCallback, useEffect } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const dragged = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!ref.current) return;
    
    isDragging.current = true;
    dragged.current = false;
    startY.current = e.clientY;
    scrollTop.current = ref.current.scrollTop;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    // We delay resetting dragged so the click event that fires right after mouseup is caught
    setTimeout(() => {
      dragged.current = false;
    }, 50);
  }, []);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
    dragged.current = false;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
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
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseMove,
  };
}
