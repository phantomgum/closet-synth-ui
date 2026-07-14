import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AtelierMannequin } from "./AtelierMannequin";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function AmbientScreen() {
  const now = useClock();

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
      exit={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="ambient-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 select-none"
    >
      {/* Slow-drifting brass aurora — pure ambient motion, no cursor */}
      <motion.div
        aria-hidden
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 20% 30%, oklch(0.9 0.09 78 / 45%), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 70%, oklch(0.85 0.06 55 / 35%), transparent 60%)",
          backgroundSize: "200% 200%",
        }}
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      />

      {/* Drifting brass particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.15, 0.6, 0.15],
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
        className="relative mt-6 font-display text-[clamp(7rem,22vw,16rem)] leading-[0.9] font-normal tracking-tight tabular-nums text-ink"
      >
        {time}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 1 }}
        className="relative mt-4 font-display italic text-2xl text-muted-foreground"
      >
        {date}
      </motion.p>

      {/* breathing brass dot */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-16 h-1.5 w-1.5 rounded-full bg-brass brass-glow"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="relative mt-4 font-sans text-[11px] tracking-[0.45em] text-muted-foreground uppercase"
      >
        Tap · Speak · Step closer
      </motion.p>
    </motion.div>
  );
}
