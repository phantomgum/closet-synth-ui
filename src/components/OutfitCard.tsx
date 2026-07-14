import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export interface OutfitItem {
  slot: string;
  title: string;
  vibe: string;
  image: string;
}

interface OutfitCardProps {
  item: OutfitItem;
  index: number;
  scrollContainer?: React.RefObject<HTMLElement | null>;
}

export function OutfitCard({ item, index, scrollContainer }: OutfitCardProps) {
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref as never,
    container: scrollContainer as never,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  // Image parallax inside the frame
  const imgY = useTransform(smooth, [0, 1], ["-8%", "8%"]);
  // Card lifts as it enters, settles at center, exits gently
  const cardY = useTransform(smooth, [0, 0.5, 1], [40, 0, -20]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0, 1, 1, 0.4]);

  return (
    <motion.article
      ref={ref as never}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      style={{ y: cardY, opacity }}
      className="linen-panel group relative overflow-hidden rounded-2xl will-change-transform"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <motion.img
          src={item.image}
          alt={item.title}
          width={768}
          height={960}
          loading="lazy"
          draggable={false}
          style={{ y: imgY, scale: 1.18 }}
          className="h-full w-full object-cover"
        />
        {/* Item index label — catalog corner */}
        <span className="absolute top-3.5 right-3.5 rounded-full bg-background/85 px-3 py-1 font-mono text-[10px] tracking-[0.35em] text-muted-foreground uppercase backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="p-5">
        <p className="font-mono text-[10px] tracking-[0.4em] text-brass uppercase">
          {item.slot}
        </p>
        <h3 className="mt-1.5 font-display text-2xl leading-tight font-normal tracking-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-1 font-display italic text-base text-muted-foreground">
          {item.vibe}
        </p>
      </div>
    </motion.article>
  );
}
