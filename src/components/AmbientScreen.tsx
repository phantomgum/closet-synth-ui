import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useClock() {
  // null until mounted — the server can't know the display's local time,
  // so rendering it during SSR would cause a hydration mismatch.
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
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="ambient-bg flex min-h-screen flex-col items-center justify-center select-none"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="font-mono text-sm tracking-[0.5em] text-muted-foreground uppercase"
      >
        Awaiting System Wake
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 1 }}
        className="text-glow mt-4 text-[clamp(6rem,20vw,14rem)] leading-none font-medium tracking-tight tabular-nums"
      >
        {time}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-6 text-2xl font-light text-muted-foreground"
      >
        {date}
      </motion.p>

      {/* breathing status dot */}
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 h-2 w-2 rounded-full bg-signal signal-glow"
      />
    </motion.div>
  );
}
