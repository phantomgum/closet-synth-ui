import { useRef, useCallback, useEffect } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const dragged = useRef(false);
  
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!ref.current) return;
    
    if (rafId.current) cancelAnimationFrame(rafId.current);

    isDragging.current = true;
    dragged.current = false;
    startY.current = e.clientY;
    scrollTop.current = ref.current.scrollTop;
    
    lastY.current = e.clientY;
    lastTime.current = performance.now();
    velocity.current = 0;
  }, []);

  const startMomentum = useCallback(() => {
    if (!ref.current) return;
    
    if (Math.abs(velocity.current) < 0.5) return;
    
    ref.current.scrollTop -= velocity.current;
    velocity.current *= 0.95; // friction
    
    rafId.current = requestAnimationFrame(startMomentum);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    setTimeout(() => {
      dragged.current = false;
    }, 50);

    const now = performance.now();
    // If the mouse was held still for a bit before releasing, stop momentum
    if (now - lastTime.current > 100) {
      velocity.current = 0;
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (Math.abs(velocity.current) > 0.5) {
      rafId.current = requestAnimationFrame(startMomentum);
    }
  }, [startMomentum]);

  const onMouseLeave = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const now = performance.now();
    if (now - lastTime.current > 100) {
      velocity.current = 0;
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (Math.abs(velocity.current) > 0.5) {
      rafId.current = requestAnimationFrame(startMomentum);
    }
  }, [startMomentum]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    
    const y = e.clientY;
    const walk = y - startY.current;
    
    const now = performance.now();
    const dt = now - lastTime.current;
    const dy = y - lastY.current;
    
    if (dt > 0) {
      velocity.current = (dy / dt) * 16; // scale by 60fps frame duration
    }
    
    lastY.current = y;
    lastTime.current = now;
    
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
        if (rafId.current) cancelAnimationFrame(rafId.current);
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
