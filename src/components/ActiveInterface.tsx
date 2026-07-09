import { motion } from "framer-motion";
import { useState } from "react";
import { ModeToggle, type ClosetMode } from "./ModeToggle";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { OutfitCard, type OutfitItem } from "./OutfitCard";
import outfitTop from "@/assets/outfit-top.jpg";
import outfitBottom from "@/assets/outfit-bottom.jpg";
import outfitShoes from "@/assets/outfit-shoes.jpg";
import outfitAccessory from "@/assets/outfit-accessory.jpg";

const OUTFIT: OutfitItem[] = [
  { slot: "Top", title: "Tech Shell Bomber", vibe: "Vibe · Midnight Utility", image: outfitTop },
  { slot: "Bottom", title: "Tapered Cargo Trouser", vibe: "Material · Ripstop Cotton", image: outfitBottom },
  { slot: "Footwear", title: "Noir Court Sneaker", vibe: "Material · Matte Leather", image: outfitShoes },
  { slot: "Accessory", title: "Obsidian Field Watch", vibe: "Vibe · Quiet Precision", image: outfitAccessory },
];

interface ActiveInterfaceProps {
  onSleep: () => void;
}

export function ActiveInterface({ onSleep }: ActiveInterfaceProps) {
  const [mode, setMode] = useState<ClosetMode>("in-closet");

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="ambient-bg min-h-screen overflow-y-auto px-8 pb-12 lg:px-14"
    >
      {/* Header */}
      <header className="flex items-center justify-between pt-8 pb-10">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-sm tracking-[0.4em] text-signal uppercase"
          >
            ● System Active
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-1 text-4xl font-bold tracking-tight"
          >
            Smart Closet
          </motion.h1>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSleep();
            }}
            aria-label="Return to standby"
            className="glass-panel rounded-full px-5 py-3.5 font-mono text-sm tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
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
      <section className="mx-auto mt-12 max-w-6xl" aria-label="Generated outfit">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex items-baseline justify-between"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Generated Fit</h2>
          <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
            Scope · {mode === "in-closet" ? "In-Closet" : "Global Wardrobe"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
          {OUTFIT.map((item, i) => (
            <OutfitCard key={item.slot} item={item} index={i} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
