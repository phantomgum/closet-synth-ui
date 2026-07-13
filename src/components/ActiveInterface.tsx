import { motion } from "framer-motion";
import { useState } from "react";
import { ModeToggle, type ClosetMode } from "./ModeToggle";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { OutfitCard, type OutfitItem } from "./OutfitCard";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import outfitTop from "@/assets/outfit-top.jpg";
import outfitBottom from "@/assets/outfit-bottom.jpg";
import outfitShoes from "@/assets/outfit-shoes.jpg";
import outfitAccessory from "@/assets/outfit-accessory.jpg";

const OUTFIT: OutfitItem[] = [
  { slot: "Top", title: "Linen Notch Blazer", vibe: "Sun-Bleached Bone", image: outfitTop },
  { slot: "Bottom", title: "Pleated Wool Trouser", vibe: "Warm Camel", image: outfitBottom },
  { slot: "Footwear", title: "Horsebit Loafer", vibe: "Cognac Calfskin", image: outfitShoes },
  { slot: "Accessory", title: "Brass Field Watch", vibe: "Cream Dial, Tan Strap", image: outfitAccessory },
];

interface ActiveInterfaceProps {
  onSleep: () => void;
}

export function ActiveInterface({ onSleep }: ActiveInterfaceProps) {
  const [mode, setMode] = useState<ClosetMode>("in-closet");
  const dragScroll = useDragScroll<HTMLDivElement>();
  const today = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      {...dragScroll}
      className="ambient-bg h-screen overflow-y-auto px-8 pb-14 lg:px-16 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Header */}
      <header className="flex items-start justify-between pt-9 pb-10">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.45em] text-muted-foreground uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brass brass-glow" />
            {today} · Atelier
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-2 font-display text-6xl leading-none font-normal tracking-tight text-ink"
          >
            Today, you'll wear<span className="italic text-brass">.</span>
          </motion.h1>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSleep();
            }}
            aria-label="Return to standby"
            className="linen-panel rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Standby
          </button>
        </div>
      </header>

      {/* Voice visualizer */}
      <section className="mx-auto max-w-3xl" aria-label="Voice command status">
        <VoiceVisualizer />
      </section>

      {/* Generated outfit grid */}
      <section className="mx-auto mt-14 max-w-6xl" aria-label="Generated outfit">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex items-end justify-between border-b border-[color:var(--linen-border)] pb-4"
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground uppercase">
              The look · N°04
            </p>
            <h2 className="mt-1 font-display text-3xl font-normal italic tracking-tight text-ink">
              Assembled for you
            </h2>
          </div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Scope — {mode === "in-closet" ? "In-Closet" : "Global Wardrobe"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {OUTFIT.map((item, i) => (
            <OutfitCard key={item.slot} item={item} index={i} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
