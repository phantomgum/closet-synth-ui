import { motion } from "framer-motion";

const BAR_COUNT = 24;

export function VoiceVisualizer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="glass-panel relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl px-10 py-12"
    >
      {/* pulsing mic core */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-signal"
          style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
        />
        <span
          className="absolute inset-0 rounded-full border border-signal"
          style={{ animation: "pulse-ring 2.4s ease-out 1.2s infinite" }}
        />
        <div className="h-16 w-16 rounded-full bg-signal-dim ring-1 ring-signal/50 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-signal signal-glow" />
        </div>
      </div>

      {/* idle waveform */}
      <div className="flex h-12 items-center gap-1.5" aria-hidden>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-signal/60"
            style={{
              height: "100%",
              animation: `waveform ${1.2 + (i % 5) * 0.25}s ease-in-out ${i * 0.08}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-3xl font-medium tracking-wide">Awaiting Voice Command…</p>
        <p className="mt-2 font-mono text-sm tracking-[0.35em] text-muted-foreground uppercase">
          Mic array · standby
        </p>
      </div>
    </motion.div>
  );
}
