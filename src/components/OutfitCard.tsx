import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type PointerEvent } from "react";

export interface OutfitItem {
  slot: string;
  title: string;
  vibe: string;
  image: string;
}

interface OutfitCardProps {
  item: OutfitItem;
  index: number;
}

const SPRING = { stiffness: 180, damping: 22, mass: 0.6 };

export function OutfitCard({ item, index }: OutfitCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Normalized pointer position within the card, in -1..1 range
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-9, 9]);
  const rotateX = useTransform(sy, [-1, 1], [7, -7]);
  const imgX = useTransform(sx, [-1, 1], [-14, 14]);
  const imgY = useTransform(sy, [-1, 1], [-10, 10]);
  const glareX = useTransform(sx, [-1, 1], ["15%", "85%"]);
  const glareY = useTransform(sy, [-1, 1], ["10%", "90%"]);

  const handleMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    px.set(x);
    py.set(y);
  };

  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      ref={ref as never}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.1, duration: 0.6, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="linen-panel group relative overflow-hidden rounded-2xl will-change-transform"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <motion.img
          src={item.image}
          alt={item.title}
          width={768}
          height={960}
          loading="lazy"
          draggable={false}
          style={{ x: imgX, y: imgY, scale: 1.08 }}
          className="h-full w-full object-cover"
        />
        {/* Cursor-follow brass glare */}
        <motion.div
          aria-hidden
          style={{
            background: useBrassGlare(glareX, glareY),
          }}
          className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {/* Item index label — catalog corner */}
        <span
          style={{ transform: "translateZ(24px)" }}
          className="absolute top-3.5 right-3.5 rounded-full bg-background/85 px-3 py-1 font-mono text-[10px] tracking-[0.35em] text-muted-foreground uppercase backdrop-blur"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="p-5" style={{ transform: "translateZ(18px)" }}>
        <p className="font-mono text-[10px] tracking-[0.4em] text-brass uppercase">
          {item.slot}
        </p>
        <h3 className="mt-1.5 font-display text-2xl leading-tight font-normal tracking-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-1 font-display italic text-base text-muted-foreground">
          {item.vibe}
        </p>
      </div>
    </motion.article>
  );
}

function useBrassGlare(x: MotionValue<string>, y: MotionValue<string>) {
  return useTransform([x, y], ([xv, yv]) =>
    `radial-gradient(circle at ${xv} ${yv}, oklch(0.85 0.12 78 / 55%), transparent 45%)`
  );
}
