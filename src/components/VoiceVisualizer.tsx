import { motion } from "framer-motion";

const BAR_COUNT = 28;

export function VoiceVisualizer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="linen-panel relative flex items-center gap-8 overflow-hidden rounded-2xl px-8 py-7"
    >
      {/* brass bloom */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full bg-brass-dim"
          style={{ animation: "bloom 2.8s ease-in-out infinite" }}
        />
        <div className="relative h-3 w-3 rounded-full bg-brass brass-glow" />
      </div>

      {/* idle waveform */}
      <div className="flex h-10 flex-1 items-center gap-[5px]" aria-hidden>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] flex-1 rounded-full bg-primary/40"
            style={{
              height: "100%",
              animation: `waveform ${1.4 + (i % 6) * 0.22}s ease-in-out ${i * 0.07}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>

      <div className="min-w-0 shrink-0 text-right">
        <p className="font-display text-2xl italic leading-none text-ink">
          Listening…
        </p>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
          Say a mood
        </p>
      </div>
    </motion.div>
  );
}
