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
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.12, duration: 0.55, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      className="glass-panel group overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          width={768}
          height={960}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="glass-panel absolute top-4 left-4 rounded-full px-4 py-1.5 font-mono text-xs tracking-[0.25em] text-foreground/80 uppercase">
          {item.slot}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
        <p className="mt-1.5 font-mono text-sm tracking-wider text-muted-foreground">
          {item.vibe}
        </p>
      </div>
    </motion.article>
  );
}
