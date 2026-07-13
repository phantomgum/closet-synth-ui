import { motion } from "framer-motion";

export interface OutfitItem {
  slot: string;
  title: string;
  vibe: string;
  image: string;
}

interface OutfitCardProps {
  item: OutfitItem;
  index: number;
}

export function OutfitCard({ item, index }: OutfitCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.1, duration: 0.6, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className="linen-panel group overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={item.image}
          alt={item.title}
          width={768}
          height={960}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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
