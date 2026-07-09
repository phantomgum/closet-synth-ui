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
      className="linen-panel flex items-center gap-1 rounded-full p-1"
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
            className={`relative rounded-full px-6 py-2.5 font-mono text-[11px] tracking-[0.3em] uppercase transition-colors duration-200 ${
              active ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
