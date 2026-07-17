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
    name: "The T-Shirt",
    paths: [
      // neckline
      "M 150 70 Q 175 90 200 70",
      // shoulders + sleeves
      "M 150 70 L 105 85 L 90 140 L 125 155 L 130 145",
      "M 200 70 L 245 85 L 260 140 L 225 155 L 220 145",
      // body sides + hem
      "M 130 145 L 125 300 L 225 300 L 220 145",
      "M 125 300 Q 175 315 225 300",
    ],
  },
  {
    name: "The Hoodie",
    paths: [
      // hood
      "M 140 60 Q 175 30 210 60",
      "M 140 60 Q 150 100 175 105 Q 200 100 210 60",
      // shoulders + long sleeves
      "M 145 90 L 95 110 L 70 260 L 110 275 L 120 240",
      "M 205 90 L 255 110 L 280 260 L 240 275 L 230 240",
      // body
      "M 120 240 L 120 330 L 230 330 L 230 240",
      // kangaroo pocket
      "M 135 240 L 130 285 L 220 285 L 215 240",
      "M 135 240 Q 175 250 215 240",
      // drawstrings
      "M 165 100 L 168 135",
      "M 185 100 L 182 135",
    ],
  },
  {
    name: "The Suit",
    paths: [
      // shoulders + lapel notch
      "M 90 70 L 140 55 L 175 90 L 210 55 L 260 70",
      "M 175 90 L 175 220",
      "M 155 105 L 175 130 L 195 105",
      // torso + hem
      "M 90 70 L 80 260 L 130 275 L 175 265 L 220 275 L 270 260 L 260 70",
      // buttons
      "M 175 165 L 175 167",
      "M 175 200 L 175 202",
      // sleeves
      "M 90 70 L 55 220 L 85 240",
      "M 260 70 L 295 220 L 265 240",
      // trouser split
      "M 130 275 L 140 400 L 170 405 L 175 300",
      "M 220 275 L 210 400 L 180 405 L 175 300",
    ],
  },
  {
    name: "The Trousers",
    paths: [
      // waistband
      "M 110 90 L 240 90 L 245 115 L 105 115 Z",
      // belt loops
      "M 130 88 L 130 96", "M 175 88 L 175 96", "M 220 88 L 220 96",
      // center crease left
      "M 145 115 L 140 380",
      // center crease right
      "M 205 115 L 210 380",
      // outer left leg
      "M 105 115 L 115 385 L 165 385 L 175 200",
      // outer right leg
      "M 245 115 L 235 385 L 185 385 L 175 200",
      // hem cuffs
      "M 115 385 L 165 385", "M 185 385 L 235 385",
    ],
  },
  {
    name: "The Shorts",
    paths: [
      // waistband
      "M 110 130 L 240 130 L 245 155 L 105 155 Z",
      // belt loops
      "M 130 128 L 130 136", "M 175 128 L 175 136", "M 220 128 L 220 136",
      // left leg
      "M 105 155 L 115 260 L 170 265 L 175 210",
      // right leg
      "M 245 155 L 235 260 L 180 265 L 175 210",
      // hem cuffs
      "M 115 260 L 170 265", "M 180 265 L 235 260",
      // crease lines
      "M 145 155 L 142 258",
      "M 205 155 L 208 258",
    ],
  },
  {
    name: "The Loafer",
    paths: [
      // sole
      "M 60 300 Q 175 335 305 305 L 300 320 Q 175 350 60 320 Z",
      // upper vamp
      "M 85 300 Q 130 235 220 240 Q 275 245 300 305",
      // top opening
      "M 130 250 Q 175 270 235 258",
      // horsebit strap
      "M 155 258 L 205 260",
      "M 158 253 L 158 268",
      "M 202 255 L 202 270",
      // heel counter
      "M 285 285 L 300 305",
      // stitch line along sole
      "M 70 315 Q 175 340 300 315",
    ],
  },
  {
    name: "The Watch",
    paths: [
      // upper strap
      "M 145 40 L 140 155 L 210 155 L 205 40",
      "M 145 40 Q 175 30 205 40",
      // strap holes
      "M 165 60 L 168 60", "M 165 85 L 168 85", "M 165 110 L 168 110",
      // watch case
      "M 130 155 L 220 155 L 225 175 L 220 275 L 130 275 L 125 175 Z",
      // crown
      "M 220 210 L 240 210 L 240 225 L 220 225",
      // dial (circle approximated)
      "M 145 215 Q 175 175 205 215 Q 235 250 205 275 Q 175 300 145 275 Q 115 250 145 215 Z",
      // hour markers
      "M 175 195 L 175 200", "M 205 225 L 210 225",
      "M 175 260 L 175 255", "M 140 225 L 145 225",
      // hands
      "M 175 230 L 175 210",
      "M 175 230 L 195 240",
      // lower strap
      "M 145 275 L 140 395 L 210 395 L 205 275",
      "M 145 395 Q 175 405 205 395",
      "M 165 300 L 168 300", "M 165 325 L 168 325", "M 165 350 L 168 350",
    ],
  },
  {
    name: "The Trench",
    paths: [
      // collar
      "M 100 55 L 145 40 L 175 70 L 205 40 L 250 55",
      // body — long silhouette
      "M 100 55 L 80 380 L 270 380 L 250 55",
      // center placket
      "M 175 70 L 175 380",
      // double-breasted buttons L
      "M 145 110 L 145 112", "M 145 150 L 145 152", "M 145 190 L 145 192",
      // double-breasted buttons R
      "M 205 110 L 205 112", "M 205 150 L 205 152", "M 205 190 L 205 192",
      // belt
      "M 85 225 L 265 225",
      "M 160 220 L 190 220 L 190 232 L 160 232 Z",
      // sleeves
      "M 100 55 L 55 280 L 85 295",
      "M 250 55 L 295 280 L 265 295",
    ],
  },
];

const TARGET = { cx: 175, cy: 235, width: 240, height: 380 };

function getBoundingBox(paths: string[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const d of paths) {
    const nums = d.match(/[-+]?\d*\.?\d+/g)?.map(Number);
    if (!nums) continue;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i];
      const y = nums[i + 1];
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    minX,
    minY,
    maxX,
    maxY,
    cx: minX + width / 2,
    cy: minY + height / 2,
    width,
    height,
  };
}

function getFitTransform(paths: string[]) {
  const box = getBoundingBox(paths);
  if (!box.width || !box.height) return "translate(0, 0)";
  const scale = Math.min(TARGET.width / box.width, TARGET.height / box.height);
  const tx = TARGET.cx - box.cx * scale;
  const ty = TARGET.cy - box.cy * scale;
  return `translate(${tx}, ${ty}) scale(${scale})`;
}

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
