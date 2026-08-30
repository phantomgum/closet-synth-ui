import {
  ArrowRight,
  Check,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  WandSparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  buildOutfitFn,
  discoverOutfitsFn,
  getClosetFn,
  type Outfit,
  type WardrobeItem,
} from "@/lib/generate-outfit";

type View = "discover" | "build";
type BuildState = "idle" | "loading" | "result";
const MOMENTS = ["Everyday sharp", "Dinner plans", "Easy weekend", "Warm weather"];

function ItemImage({ item, className = "" }: { item: WardrobeItem; className?: string }) {
  return (
    <img
      src={item.image}
      alt={item.title}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
    />
  );
}

function Look({ look, featured = false }: { look: Outfit; featured?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28, rotateX: -4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className={`look-card ${featured ? "look-card-featured" : ""}`}
    >
      <div className="look-collage">
        {look.items.slice(0, 4).map((item) => (
          <ItemImage item={item} key={item.id} />
        ))}
      </div>
      <div className="look-copy">
        <p className="eyebrow">{featured ? "Fresh from your closet" : "Curated look"}</p>
        <h2>{look.label}</h2>
        <p>{look.note}</p>
        <div className="look-pieces">
          {look.items.map((item) => (
            <span key={item.id}>{item.slot}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export function ActiveInterface() {
  const [view, setView] = useState<View>("discover");
  const [closet, setCloset] = useState<WardrobeItem[]>([]);
  const [looks, setLooks] = useState<Outfit[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [moment, setMoment] = useState(MOMENTS[0]);
  const [buildState, setBuildState] = useState<BuildState>("idle");
  const [builtItems, setBuiltItems] = useState<WardrobeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const selected = closet.find((item) => item.id === selectedId) ?? closet[0];
  const categories = useMemo(() => [...new Set(closet.map((item) => item.slot))], [closet]);

  const refreshDiscover = async () => {
    setLoadingDiscover(true);
    setError(null);
    try {
      setLooks((await discoverOutfitsFn()).looks);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your edits couldn't be loaded.");
    } finally {
      setLoadingDiscover(false);
    }
  };

  useEffect(() => {
    getClosetFn()
      .then(({ items }) => {
        setCloset(items);
        setSelectedId(items[0]?.id ?? "");
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Your closet couldn't be loaded."),
      );
    refreshDiscover();
  }, []);

  const build = async () => {
    if (!selected) return;
    setBuildState("loading");
    setError(null);
    try {
      const result = await buildOutfitFn({ data: { anchorId: selected.id, prompt: moment } });
      setBuiltItems(result.items);
      setBuildState("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your look couldn't be created.");
      setBuildState("idle");
    }
  };

  return (
    <main className="closet-app">
      <div className="atmosphere" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <header className="app-header">
        <button className="wordmark" onClick={() => setView("discover")} aria-label="Closetly home">
          closetly<span>·</span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={view === "discover" ? "active" : ""}
            onClick={() => setView("discover")}
          >
            Discover
          </button>
          <button className={view === "build" ? "active" : ""} onClick={() => setView("build")}>
            Build a look
          </button>
        </nav>
        <p className="closet-count">
          <span /> {closet.length || "—"} pieces in your closet
        </p>
      </header>
      {error && (
        <div className="app-error" role="alert">
          {error}
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === "discover" ? (
          <motion.section
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            className="discover-page"
          >
            <motion.div
              className="discover-hero"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">Live closet intelligence</p>
              <h1>
                Looks you already
                <br />
                <em>own.</em>
              </h1>
              <p>Thoughtful combinations from the pieces in your closet. No shopping, no noise.</p>
              <button className="text-action" onClick={refreshDiscover} disabled={loadingDiscover}>
                <RefreshCw size={15} className={loadingDiscover ? "spin" : ""} /> Refresh the edit
              </button>
            </motion.div>
            {loadingDiscover ? (
              <div className="loading-edit">
                <LoaderCircle className="spin" size={26} /> Styling your closet into three fresh
                looks…
              </div>
            ) : (
              <div className="discover-grid">
                {looks.map((look, index) => (
                  <Look key={look.id} look={look} featured={index === 0} />
                ))}
                {looks.length === 0 && (
                  <div className="empty-state">Your first edit will appear here.</div>
                )}
              </div>
            )}
            <div className="discover-footer">
              <span>Want to start with a favorite?</span>
              <button onClick={() => setView("build")}>
                Build a look <ArrowRight size={16} />
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="build"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="builder-page"
          >
            <motion.div
              className="builder-intro"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.65 }}
            >
              <p className="eyebrow">The one-piece method</p>
              <h1>
                Start with
                <br />
                <em>the piece.</em>
              </h1>
              <p>Choose the item you want to wear. We’ll build everything else around it.</p>
            </motion.div>
            <div className="builder-layout">
              <div className="picker-panel">
                <div className="picker-heading">
                  <span>1</span>
                  <div>
                    <p className="eyebrow">Choose your starting point</p>
                    <h2>Your closet</h2>
                  </div>
                </div>
                <div className="category-row">
                  {categories.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
                <div className="garment-grid">
                  {closet.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.018, 0.32) }}
                      whileHover={{ y: -5, scale: 1.015 }}
                      whileTap={{ scale: 0.97 }}
                      className={`garment ${selected?.id === item.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedId(item.id);
                        setBuildState("idle");
                      }}
                    >
                      <div className="garment-image">
                        <ItemImage item={item} />
                        {selected?.id === item.id && (
                          <i>
                            <Check size={14} />
                          </i>
                        )}
                      </div>
                      <span>{item.subcategory}</span>
                      <small>{item.color}</small>
                    </motion.button>
                  ))}
                </div>
              </div>
              <aside className="build-panel">
                {selected && (
                  <div className="hero-piece">
                    <ItemImage item={selected} />
                    <div>
                      <p className="eyebrow">Your hero piece</p>
                      <h2>{selected.title}</h2>
                      <p>{selected.vibe}</p>
                    </div>
                  </div>
                )}
                <div className="moment-picker">
                  <div className="picker-heading">
                    <span>2</span>
                    <div>
                      <p className="eyebrow">Set the mood</p>
                      <h2>Where are you going?</h2>
                    </div>
                  </div>
                  <div className="moment-chips">
                    {MOMENTS.map((option) => (
                      <button
                        key={option}
                        onClick={() => setMoment(option)}
                        className={moment === option ? "selected" : ""}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="build-button"
                  onClick={build}
                  disabled={!selected || buildState === "loading"}
                >
                  {buildState === "loading" ? (
                    <>
                      <LoaderCircle className="spin" /> Building your look
                    </>
                  ) : (
                    <>
                      <WandSparkles /> Build my look <ChevronRight />
                    </>
                  )}
                </button>
                {buildState === "result" && (
                  <div className="built-look">
                    <p className="eyebrow">Your completed look</p>
                    <div className="built-images">
                      {builtItems.map((item) => (
                        <ItemImage item={item} key={item.id} />
                      ))}
                    </div>
                    <p>{builtItems.map((item) => item.subcategory).join(" · ")}</p>
                  </div>
                )}
              </aside>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
