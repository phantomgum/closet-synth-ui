import { motion } from "framer-motion";

export type ClosetMode = "in-closet" | "global";

interface ModeToggleProps {
  mode: ClosetMode;
  onChange: (mode: ClosetMode) => void;
}

const OPTIONS: { value: ClosetMode; label: string }[] = [
  { value: "in-closet", label: "In-Closet" },
  { value: "global", label: "Global" },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="glass-panel flex items-center gap-1 rounded-full p-1.5"
      role="radiogroup"
      aria-label="Wardrobe scope"
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
            }}
            className={`relative rounded-full px-7 py-3.5 text-lg font-semibold tracking-wide transition-colors duration-200 ${
              active ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-primary signal-glow"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
