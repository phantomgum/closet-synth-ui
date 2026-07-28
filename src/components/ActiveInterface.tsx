import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ModeToggle, type ClosetMode } from "./ModeToggle";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { OutfitCard, type OutfitItem } from "./OutfitCard";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { Sparkles, Camera } from "lucide-react";
import { generateOutfitFn } from "../lib/generate-outfit";
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

const DEFAULT_OUTFIT_PROMPT = "Create a versatile outfit for today.";

interface ActiveInterfaceProps {
  onSleep: () => void;
}

export function ActiveInterface({ onSleep }: ActiveInterfaceProps) {
  const [mode, setMode] = useState<ClosetMode>("in-closet");
  const [userPrompt, setUserPrompt] = useState("");
  const [currentView, setCurrentView] = useState<'home' | 'loading' | 'results'>('home');
  const [generatedOutfit, setGeneratedOutfit] = useState<OutfitItem[]>(OUTFIT);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const dragScroll = useDragScroll<HTMLDivElement>();
  const scrollRef = useRef<HTMLElement | null>(null);

  // Scroll-linked header parallax + fade
  const { scrollY } = useScroll({ container: dragScroll.ref as never });
  const headerY = useTransform(scrollY, [0, 300], [0, -60]);
  const headerOpacity = useTransform(scrollY, [0, 220], [1, 0.15]);
  const titleScale = useTransform(scrollY, [0, 300], [1, 0.85]);
  const progress = useTransform(scrollY, [0, 800], ["0%", "100%"]);

  const today = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Every screen change starts at a predictable place. Without this, returning
  // from a long results screen leaves the hub scrolled away from its controls.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [currentView]);

  const handleGenerateOutfit = async () => {
    const prompt = userPrompt.trim() || DEFAULT_OUTFIT_PROMPT;
    setUserPrompt(prompt);
    setGenerationError(null);
    setCurrentView("loading");

    try {
      const data = await generateOutfitFn({
        data: { prompt, mode },
      });

      setGeneratedOutfit(data.outfit || data);
      setCurrentView("results");
    } catch (error) {
      console.error("Failed to generate outfit:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Unable to generate an outfit. Please try again.",
      );
      setCurrentView("home");
    }
  };

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      {...dragScroll}
      ref={(el) => {
        dragScroll.ref.current = el;
        scrollRef.current = el;
      }}
      className="ambient-bg h-screen overflow-y-auto px-8 pb-24 lg:px-16 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Scroll progress rail — brass thread */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-20 h-[2px] bg-transparent"
      >
        <motion.div
          style={{ width: progress }}
          className="h-full bg-brass brass-glow"
        />
      </motion.div>

      {/* Header */}
      <motion.header
        style={{ y: headerY, opacity: headerOpacity }}
        className="flex items-start justify-between pt-9 pb-10"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.45em] text-muted-foreground uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brass brass-glow" />
            {today} · Atelier
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ scale: titleScale, transformOrigin: "left center" }}
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
            className="linen-panel rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase transition-colors hover:text-foreground active:scale-95"
          >
            Standby
          </button>
        </div>
      </motion.header>

      {currentView === 'home' && (
        <>
          {/* Voice visualizer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl"
            aria-label="Voice command status"
          >
            <VoiceVisualizer />
          </motion.section>

          {/* Vibe / Prompt Input & Action Buttons */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-3xl flex flex-col gap-5"
          >
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter vibe, aesthetic, or weather..."
              className="w-full rounded-3xl border border-white/20 bg-white/10 px-8 py-6 text-2xl font-light text-ink placeholder:text-ink/40 backdrop-blur-xl focus:border-brass/50 focus:outline-none focus:ring-1 focus:ring-brass/50 transition-all shadow-sm"
            />
            {generationError && (
              <p
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-950/10 px-5 py-4 text-base text-red-800"
              >
                {generationError}
              </p>
            )}
            
            <div className="flex w-full gap-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerateOutfit}
                className="flex flex-1 items-center justify-center gap-3 rounded-3xl bg-ink px-6 py-6 text-xl font-medium text-white shadow-xl transition-all hover:bg-ink/90"
              >
                <Sparkles className="h-6 w-6" />
                Generate New Outfit
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => console.log("Review My Fit clicked", { userPrompt })}
                className="flex flex-1 items-center justify-center gap-3 rounded-3xl border border-ink/10 bg-white/30 px-6 py-6 text-xl font-medium text-ink shadow-sm backdrop-blur-xl transition-all hover:bg-white/50"
              >
                <Camera className="h-6 w-6" />
                Review My Fit
              </motion.button>
            </div>
          </motion.section>
        </>
      )}

      {currentView === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white"
        >
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute h-40 w-40 rounded-full bg-brass/40 blur-3xl"
            />
            <div className="relative h-20 w-20 rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-brass" />
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-light text-zinc-400 text-center max-w-md"
          >
            Assembling outfit based on:<br/>
            <span className="text-white font-medium italic mt-4 block">"{userPrompt}"</span>
          </motion.p>
        </motion.div>
      )}

      {currentView === 'results' && (
        <section className="mx-auto mt-14 max-w-6xl" aria-label="Generated outfit">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="grid grid-cols-2 gap-5 xl:grid-cols-4"
          >
            {generatedOutfit.map((item, i) => (
              <OutfitCard
                key={`${item.slot}-${i}`}
                item={item}
                index={i}
                scrollContainer={scrollRef}
              />
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-16 flex justify-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentView("home");
              }}
              className="rounded-3xl bg-ink px-10 py-5 text-lg font-medium text-white shadow-xl transition-all hover:bg-ink/90 flex items-center gap-2"
            >
              Back to Hub
            </motion.button>
          </motion.div>

          {/* Bottom scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-20 flex flex-col items-center gap-3"
          >
            <span className="h-8 w-px bg-brass/40" />
            <p className="font-mono text-[10px] tracking-[0.45em] text-muted-foreground uppercase">
              End of look
            </p>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}
