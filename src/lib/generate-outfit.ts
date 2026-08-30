import { createServerFn } from "@tanstack/react-start";

const AWS_API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;
const OUTFIT_SLOTS = ["Top", "Bottom", "Footwear", "Accessory"] as const;
const REQUIRED_SLOTS = ["Top", "Bottom", "Footwear"] as const;
type OutfitSlot = (typeof OUTFIT_SLOTS)[number];

export type WardrobeItem = {
  id: string;
  slot: OutfitSlot;
  title: string;
  vibe: string;
  image: string;
  color: string;
  material: string;
  subcategory: string;
};

export type Outfit = { id: string; label: string; note: string; items: WardrobeItem[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : "");
const toSlot = (value: unknown): OutfitSlot | undefined =>
  OUTFIT_SLOTS.includes(value as OutfitSlot) ? (value as OutfitSlot) : undefined;

function normalizeItem(value: unknown): WardrobeItem | undefined {
  if (!isRecord(value)) return undefined;
  const id = text(value.id) || text(value.ItemId);
  const slot = toSlot(value.itemType);
  const image = text(value.imageUrl) || text(value.image);
  const subcategory = text(value.subcategory);
  if (!id || !slot || !image || !subcategory) return undefined;
  const color = text(value.color) || "Wardrobe";
  const material = text(value.material);
  return {
    id,
    slot,
    image,
    subcategory,
    color,
    material,
    title: [color, material, subcategory].filter(Boolean).join(" "),
    vibe: text(value.vibe) || "From your closet",
  };
}

async function inventory(): Promise<WardrobeItem[]> {
  if (!AWS_API_GATEWAY_URL) throw new Error("Your wardrobe service is not configured.");
  let response: Response;
  try {
    response = await fetch(AWS_API_GATEWAY_URL);
  } catch {
    throw new Error("We couldn't reach your wardrobe. Please try again.");
  }
  if (!response.ok) throw new Error("Your wardrobe couldn't be loaded right now.");
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error("Your wardrobe returned an unexpected response.");
  return body.map(normalizeItem).filter((item): item is WardrobeItem => Boolean(item));
}

function availableWardrobe(items: WardrobeItem[]) {
  // Every inventory record is available for styling. The old inCloset flag was
  // a laundry-state experiment and should not determine recommendation scope.
  const missing = REQUIRED_SLOTS.filter((slot) => !items.some((item) => item.slot === slot));
  if (missing.length) throw new Error(`Add ${missing.join(", ")} pieces to create complete looks.`);
  return items;
}

function analyzeEndpoint() {
  if (!AWS_API_GATEWAY_URL) throw new Error("Your styling service is not configured.");
  const endpoint = new URL(AWS_API_GATEWAY_URL);
  endpoint.pathname = endpoint.pathname.replace(/\/[^/]+$/, "/analyze");
  return endpoint.toString();
}

const STYLE_SIGNALS = [
  {
    request: ["dinner", "date", "sharp", "formal", "office", "event"],
    garment: ["dress", "button", "chino", "corduroy", "polo", "knit", "sweater", "loafer"],
  },
  {
    request: ["weekend", "casual", "off duty", "relaxed", "easy"],
    garment: ["hoodie", "jogger", "sweat", "graphic", "athletic", "sneaker", "cargo"],
  },
  {
    request: ["warm", "summer", "sun", "hot"],
    garment: ["short", "camp collar", "short sleeve", "polo", "jersey"],
  },
  {
    request: ["cold", "winter", "layer", "rain", "wind"],
    garment: ["hoodie", "jacket", "sweater", "quarter", "long sleeve", "fleece", "shacket"],
  },
] as const;

function promptSeed(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function words(value: string) {
  return (
    value
      .toLowerCase()
      .match(/[a-z]+/g)
      ?.filter((word) => word.length > 2) ?? []
  );
}

function garmentSearchText(item: WardrobeItem) {
  return [item.title, item.vibe, item.color, item.material, item.subcategory]
    .join(" ")
    .toLowerCase();
}

function relevanceScore(item: WardrobeItem, prompt: string, index: number) {
  const requestWords = words(prompt);
  const garmentText = garmentSearchText(item);
  let score = requestWords.reduce((total, word) => total + (garmentText.includes(word) ? 5 : 0), 0);

  STYLE_SIGNALS.forEach((signal) => {
    if (signal.request.some((term) => prompt.toLowerCase().includes(term))) {
      score += signal.garment.reduce(
        (total, term) => total + (garmentText.includes(term) ? 4 : 0),
        0,
      );
    }
  });

  // Stable, prompt-specific tiebreaking lets fresh briefs surface different pieces.
  return score * 1_000 + ((promptSeed(`${prompt}-${item.id}`) + index) % 997);
}

function diverseTopCandidates(items: WardrobeItem[], limit: number, prompt: string) {
  const ranked = items
    .map((item, index) => ({ item, score: relevanceScore(item, prompt, index) }))
    .sort((left, right) => right.score - left.score);
  const selected: WardrobeItem[] = [];
  const seenSubcategories = new Set<string>();

  for (const { item } of ranked) {
    const key = item.subcategory.toLowerCase();
    if (!seenSubcategories.has(key)) {
      selected.push(item);
      seenSubcategories.add(key);
    }
    if (selected.length === limit) return selected;
  }

  for (const { item } of ranked) {
    if (!selected.some((candidate) => candidate.id === item.id)) selected.push(item);
    if (selected.length === limit) break;
  }
  return selected;
}

function stylingShortlist(source: WardrobeItem[], prompt: string, anchorId?: string) {
  // Every item competes in retrieval. Gemini receives only the best, diverse edit
  // so the request completes within API Gateway's response deadline.
  const limits: Record<WardrobeItem["slot"], number> = {
    Top: 12,
    Bottom: 9,
    Footwear: 7,
    Accessory: 4,
  };
  const selected = new Map<string, WardrobeItem>();

  OUTFIT_SLOTS.forEach((slot) => {
    diverseTopCandidates(
      source.filter((item) => item.slot === slot),
      limits[slot],
      prompt,
    ).forEach((item) => selected.set(item.id, item));
  });

  const anchor = source.find((item) => item.id === anchorId);
  if (anchor) selected.set(anchor.id, anchor);
  return [...selected.values()];
}

async function select(prompt: string, source: WardrobeItem[], anchorId?: string) {
  const registry = stylingShortlist(source, prompt, anchorId).map(({ id, slot, title, vibe }) => ({
    id,
    slot,
    title,
    vibe,
  }));
  const anchoredPrompt = anchorId
    ? `${prompt}\n\nNON-NEGOTIABLE HERO PIECE: Include registry item id "${anchorId}" in the final outfit. Build the look around it; do not replace it.`
    : prompt;
  let response: Response;
  try {
    response = await fetch(analyzeEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "outfit-generation",
        prompt: anchoredPrompt,
        registry,
        anchorId,
      }),
    });
  } catch {
    throw new Error("Styling is taking a breather. Please try again.");
  }
  if (!response.ok) throw new Error("Styling is unavailable right now. Please try again.");
  const body: unknown = await response.json();
  const selected = isRecord(body) && Array.isArray(body.outfit) ? body.outfit : body;
  if (!Array.isArray(selected))
    throw new Error("That look couldn't be assembled. Please try again.");
  const byId = new Map(source.map((item) => [item.id, item]));
  const resolved = selected.map((entry) => {
    if (!isRecord(entry)) return undefined;
    const item = byId.get(text(entry.id));
    return item && toSlot(entry.slot) === item.slot ? item : undefined;
  });
  if (resolved.some((item) => !item))
    throw new Error("Styling selected a piece outside your closet.");
  const look = resolved as WardrobeItem[];
  const slots = look.map((item) => item.slot);
  if (
    look.length < 3 ||
    look.length > 6 ||
    new Set(look.map((item) => item.id)).size !== look.length ||
    REQUIRED_SLOTS.some((slot) => !slots.includes(slot))
  ) {
    throw new Error("That look wasn't complete. Please try again.");
  }
  if (anchorId && !look.some((item) => item.id === anchorId))
    throw new Error("Styling missed your chosen piece. Please try again.");
  return look;
}

export const getClosetFn = createServerFn({ method: "GET" }).handler(async () => ({
  items: availableWardrobe(await inventory()),
}));

export const buildOutfitFn = createServerFn({ method: "POST" })
  .validator((data: { anchorId: string; prompt?: string }) => data)
  .handler(async ({ data }) => {
    const items = availableWardrobe(await inventory());
    const anchor = items.find((item) => item.id === data.anchorId);
    if (!anchor) throw new Error("Choose a piece from your closet first.");
    const mood = text(data.prompt) || "a confident, considered outfit for today";
    return {
      items: await select(
        `Create ${mood}. The selected hero piece is a ${anchor.title}.`,
        items,
        anchor.id,
      ),
    };
  });

const DISCOVERY_BRIEFS = [
  ["The everyday edit", "Easy, polished, and ready for whatever the day becomes."],
  ["Off-duty, elevated", "Relaxed proportions with a deliberate finish."],
  ["A change of pace", "A fresh combination that still feels like you."],
] as const;

export const discoverOutfitsFn = createServerFn({ method: "GET" }).handler(async () => {
  const items = availableWardrobe(await inventory());
  const anchors = ["Top", "Bottom", "Footwear"].map((slot) =>
    items.find((item) => item.slot === slot),
  );
  const looks = await Promise.all(
    DISCOVERY_BRIEFS.map(async ([label, note], index) => ({
      id: `edit-${index + 1}`,
      label,
      note,
      items: await select(
        `${note} Create an outfit from this in-closet wardrobe.`,
        items,
        anchors[index]?.id,
      ),
    })),
  );
  return { looks };
});
