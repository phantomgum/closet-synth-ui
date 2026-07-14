import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * AtelierMannequin — a slow, self-drawing brass line-art garment
 * that sketches itself, breathes, dissolves, and redraws as a new
 * silhouette. Feels like a couturier's pattern coming alive.
 */

type Silhouette = {
  name: string;
  // Each path is drawn in sequence with stroke-dashoffset animation
  paths: string[];
};

const SILHOUETTES: Silhouette[] = [
  {
    name: "The Blazer",
    paths: [
      // shoulders + lapel
      "M 90 70 L 140 55 L 175 90 L 210 55 L 260 70",
      // torso outline
      "M 90 70 L 80 240 L 130 260 L 175 250 L 220 260 L 270 240 L 260 70",
      // lapel notch
      "M 175 90 L 175 200",
      "M 155 105 L 175 130 L 195 105",
      // buttons
      "M 175 160 L 175 162",
      "M 175 190 L 175 192",
      // sleeves
      "M 90 70 L 55 210 L 85 230",
      "M 260 70 L 295 210 L 265 230",
    ],
  },
  {
    name: "The Trench",
    paths: [
      // collar
      "M 100 55 L 145 40 L 175 70 L 205 40 L 250 55",
      // body — long silhouette
      "M 100 55 L 80 320 L 270 320 L 250 55",
      // center placket
      "M 175 70 L 175 320",
      // double-breasted buttons L
      "M 145 110 L 145 112", "M 145 150 L 145 152", "M 145 190 L 145 192",
      // double-breasted buttons R
      "M 205 110 L 205 112", "M 205 150 L 205 152", "M 205 190 L 205 192",
      // belt
      "M 85 205 L 265 205",
      "M 160 200 L 190 200 L 190 210 L 160 210 Z",
      // sleeves
      "M 100 55 L 55 260",
      "M 250 55 L 295 260",
    ],
  },
  {
    name: "The Slip Dress",
    paths: [
      // straps
      "M 130 55 L 145 130",
      "M 220 55 L 205 130",
      // bodice
      "M 145 130 L 175 115 L 205 130",
      // waist
      "M 145 130 L 130 220 L 220 220 L 205 130",
      // flowing skirt
      "M 130 220 Q 90 320 70 400 L 280 400 Q 260 320 220 220",
      // hem sway line
      "M 90 380 Q 175 395 260 380",
    ],
  },
];

export function AtelierMannequin() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Rotate silhouette every ~12s (draw ~5s, hold ~5s, exit ~2s)
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SILHOUETTES.length);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const current = SILHOUETTES[index];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Orbiting brass ring behind the figure */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute h-[min(78vh,780px)] w-[min(78vh,780px)] opacity-40"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.72 0.11 75)" stopOpacity="0" />
              <stop offset="0.5" stopColor="oklch(0.75 0.13 78)" stopOpacity="0.7" />
              <stop offset="1" stopColor="oklch(0.72 0.11 75)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="48"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="0.15"
            strokeDasharray="0.5 2"
          />
        </svg>
      </motion.div>

      {/* Inner counter-rotating tick ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute h-[min(68vh,680px)] w-[min(68vh,680px)] opacity-25"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1="50" y1="2" x2="50" y2={i % 5 === 0 ? "5" : "3.5"}
              stroke="oklch(0.72 0.11 75)"
              strokeWidth="0.15"
              transform={`rotate(${i * 6} 50 50)`}
            />
          ))}
        </svg>
      </motion.div>

      {/* Self-drawing mannequin */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[min(70vh,700px)] w-[min(70vh,700px)]"
        >
          <svg
            viewBox="0 0 350 440"
            className="h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="thread" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="oklch(0.78 0.13 80)" />
                <stop offset="1" stopColor="oklch(0.65 0.11 65)" />
              </linearGradient>
              <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>

            {/* Glow underlayer */}
            <g stroke="url(#thread)" strokeWidth="2.2" fill="none" opacity="0.35" filter="url(#soft-glow)">
              {current.paths.map((d, i) => (
                <motion.path
                  key={`glow-${i}`}
                  d={d}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2.2,
                    delay: i * 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}
            </g>

            {/* Crisp thread on top */}
            <g stroke="url(#thread)" strokeWidth="0.9" fill="none">
              {current.paths.map((d, i) => (
                <motion.path
                  key={`line-${i}`}
                  d={d}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 2.2,
                    delay: i * 0.18,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.6, delay: i * 0.18 },
                  }}
                />
              ))}
            </g>

            {/* Traveling brass sparks along the outline (subtle) */}
            <g fill="oklch(0.85 0.14 80)">
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`spark-${i}`}
                  r="1.4"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    cx: [80, 260, 175, 80],
                    cy: [70, 240, 320, 70],
                  }}
                  transition={{
                    duration: 8,
                    delay: 3 + i * 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </g>
          </svg>

          {/* Silhouette caption */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.6, duration: 1 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-brass uppercase whitespace-nowrap"
          >
            Sketching · {current.name}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
