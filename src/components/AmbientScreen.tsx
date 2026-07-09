import { motion } from "framer-motion";
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

export function AmbientScreen() {
  const now = useClock();
  const time = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
      {/* Corner marks — atelier catalog feel */}
      <div className="pointer-events-none absolute inset-6 flex items-start justify-between font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
        <span>Atelier · N°01</span>
        <span>Standby</span>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 1 }}
        className="font-sans text-xs tracking-[0.55em] text-muted-foreground uppercase"
      >
        Good to see you
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 1.1, ease: "easeOut" }}
        className="mt-6 font-display text-[clamp(7rem,22vw,16rem)] leading-[0.9] font-normal tracking-tight tabular-nums text-ink"
      >
        {time}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 1 }}
        className="mt-4 font-display italic text-2xl text-muted-foreground"
      >
        {date}
      </motion.p>

      {/* breathing brass dot */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 h-1.5 w-1.5 rounded-full bg-brass brass-glow"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="mt-4 font-sans text-[11px] tracking-[0.45em] text-muted-foreground uppercase"
      >
        Step closer to begin
      </motion.p>
    </motion.div>
  );
}
