import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useCursor() {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX / window.innerWidth);
      y.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);
  return { x: useSpring(x, { stiffness: 90, damping: 20 }), y: useSpring(y, { stiffness: 90, damping: 20 }) };
}

export function AmbientScreen() {
  const now = useClock();
  const { x: cx, y: cy } = useCursor();

  // Soft brass spotlight follows cursor
  const spotX = useTransform(cx, [0, 1], ["0%", "100%"]);
  const spotY = useTransform(cy, [0, 1], ["0%", "100%"]);
  const spotBg = useTransform([spotX, spotY], ([sx, sy]) =>
    `radial-gradient(circle 40vmax at ${sx} ${sy}, oklch(0.9 0.08 78 / 55%), transparent 55%)`
  );

  // Time letters magnetic pull toward cursor
  const shiftX = useTransform(cx, [0, 1], [-14, 14]);
  const shiftY = useTransform(cy, [0, 1], [-8, 8]);
  const dateShift = useTransform(cx, [0, 1], [6, -6]);

  const time = now
    ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    : "--:--";
  const date = now
    ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    : "\u00A0";

  return (
    <motion.div
      key="ambient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="ambient-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 select-none"
    >
      {/* Cursor-follow brass spotlight */}
      <motion.div
        aria-hidden
        style={{ background: spotBg }}
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      />

      {/* Drifting brass particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.55, 0.15],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 41) % 100}%`,
            }}
            className="absolute h-1 w-1 rounded-full bg-brass/60"
          />
        ))}
      </div>

      {/* Corner marks — atelier catalog feel */}
      <div className="pointer-events-none absolute inset-6 flex items-start justify-between font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
        <span>Atelier · N°01</span>
        <span>Standby</span>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 1 }}
        className="relative font-sans text-xs tracking-[0.55em] text-muted-foreground uppercase"
      >
        Good to see you
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 1.1, ease: "easeOut" }}
        style={{ x: shiftX, y: shiftY }}
        className="relative mt-6 font-display text-[clamp(7rem,22vw,16rem)] leading-[0.9] font-normal tracking-tight tabular-nums text-ink"
      >
        {time}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 1 }}
        style={{ x: dateShift }}
        className="relative mt-4 font-display italic text-2xl text-muted-foreground"
      >
        {date}
      </motion.p>

      {/* breathing brass dot */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-16 h-1.5 w-1.5 rounded-full bg-brass brass-glow"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="relative mt-4 font-sans text-[11px] tracking-[0.45em] text-muted-foreground uppercase"
      >
        Move · Speak · Step closer
      </motion.p>
    </motion.div>
  );
}
