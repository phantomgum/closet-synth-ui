import { createServerFn } from "@tanstack/react-start";

const AWS_API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const REQUIRED_SLOTS = ["Top", "Bottom", "Footwear", "Accessory"] as const;
type OutfitSlot = (typeof REQUIRED_SLOTS)[number];

export type OutfitItem = {
  slot: OutfitSlot;
  title: string;
  vibe: string;
  image: string;
};

type InventoryItem = OutfitItem & {
  id: string;
  inCloset: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toOutfitSlot(value: unknown): OutfitSlot | undefined {
  return REQUIRED_SLOTS.includes(value as OutfitSlot) ? (value as OutfitSlot) : undefined;
}

function normalizeInventoryItem(value: unknown): InventoryItem | undefined {
  if (!isRecord(value)) return undefined;

  const id = stringValue(value.id) ?? stringValue(value.ItemId);
  const slot = toOutfitSlot(value.itemType);
  const image = stringValue(value.imageUrl) ?? stringValue(value.image);
  const subcategory = stringValue(value.subcategory);

  if (!id || !slot || !image || !subcategory) return undefined;

  const title = [stringValue(value.color), stringValue(value.material), subcategory]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    slot,
    title,
    vibe: stringValue(value.vibe) ?? "From your wardrobe",
    image,
    inCloset: value.inCloset === true || value.in_closet === true,
  };
}

async function fetchInventory(mode: string): Promise<InventoryItem[]> {
  if (!AWS_API_GATEWAY_URL) {
    throw new Error("Wardrobe inventory service is not configured.");
  }

  let response: Response;
  try {
    response = await fetch(AWS_API_GATEWAY_URL);
  } catch {
    throw new Error("Unable to reach the wardrobe inventory service. Please try again.");
  }

  if (!response.ok) {
    throw new Error(`Wardrobe inventory service returned ${response.status}. Please try again.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Wardrobe inventory returned an unexpected response.");
  }

  const inventory = payload
    .map(normalizeInventoryItem)
    .filter((item): item is InventoryItem => Boolean(item));
  return mode === "in-closet" ? inventory.filter((item) => item.inCloset) : inventory;
}

function ensureRequiredSlots(inventory: InventoryItem[], mode: string) {
  const missing = REQUIRED_SLOTS.filter((slot) => !inventory.some((item) => item.slot === slot));
  if (missing.length === 0) return;

  const scope = mode === "in-closet" ? "your in-closet wardrobe" : "the wardrobe inventory";
  throw new Error(
    `${scope} is missing: ${missing.join(", ")}. Add those items before generating a complete outfit.`,
  );
}

function getGeminiErrorDetails(body: string) {
  try {
    const payload: unknown = JSON.parse(body);
    if (isRecord(payload) && isRecord(payload.error)) {
      const error = payload.error;
      return {
        code: error.code,
        status: error.status,
        message: error.message,
      };
    }
  } catch {
    // Fall through to retain a bounded copy of a non-JSON error response.
  }

  return { body: body.slice(0, 2_000) };
}

async function selectOutfit(prompt: string, inventory: InventoryItem[]): Promise<OutfitItem[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("Outfit generation is not configured.");
  }

  const registry = inventory.map(({ id, slot, title, vibe }) => ({ id, slot, title, vibe }));
  const promptContent = `
You are an elite algorithmic fashion stylist.
The user wants an outfit based on this request: "${prompt}".

AVAILABLE WARDROBE REGISTRY:
${JSON.stringify(registry)}

Select exactly one item for each required slot: Top, Bottom, Footwear, Accessory.
Return only the slot and id from the registry. Never create an item or id.
`;

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContent }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  slot: { type: "STRING", enum: REQUIRED_SLOTS },
                  id: { type: "STRING" },
                },
                required: ["slot", "id"],
              },
            },
          },
        }),
      },
    );
  } catch (error) {
    console.error("Gemini outfit generation request could not be sent", {
      message: error instanceof Error ? error.message : String(error),
    });
    throw new Error("The styling service is temporarily unavailable. Please try again.");
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("Gemini outfit generation request failed", {
      status: response.status,
      statusText: response.statusText,
      error: getGeminiErrorDetails(body),
    });
    throw new Error("The styling service is temporarily unavailable. Please try again.");
  }

  const payload: unknown = await response.json();
  const text = isRecord(payload)
    ? stringValue(
        (payload.candidates as { content?: { parts?: { text?: unknown }[] }[] }[] | undefined)?.[0]
          ?.content?.parts?.[0]?.text,
      )
    : undefined;

  if (!text) throw new Error("The styling service returned no outfit. Please try again.");

  let selections: unknown;
  try {
    selections = JSON.parse(text);
  } catch {
    throw new Error("The styling service returned an invalid outfit. Please try again.");
  }

  if (!Array.isArray(selections))
    throw new Error("The styling service returned an invalid outfit. Please try again.");

  const itemsById = new Map(inventory.map((item) => [item.id, item]));
  const outfit = selections.map((selection) => {
    if (!isRecord(selection)) return undefined;
    const id = stringValue(selection.id);
    const slot = toOutfitSlot(selection.slot);
    const item = id ? itemsById.get(id) : undefined;
    return item && slot === item.slot ? item : undefined;
  });

  if (outfit.some((item) => !item)) {
    throw new Error(
      "The styling service selected an item outside your wardrobe. Please try again.",
    );
  }

  const resolved = outfit as InventoryItem[];
  const slots = resolved.map((item) => item.slot);
  if (
    resolved.length !== REQUIRED_SLOTS.length ||
    new Set(slots).size !== REQUIRED_SLOTS.length ||
    REQUIRED_SLOTS.some((slot) => !slots.includes(slot))
  ) {
    throw new Error("The styling service did not create a complete outfit. Please try again.");
  }

  return REQUIRED_SLOTS.map((slot) => {
    const item = resolved.find((candidate) => candidate.slot === slot)!;
    return { slot: item.slot, title: item.title, vibe: item.vibe, image: item.image };
  });
}

export const generateOutfitFn = createServerFn({ method: "POST" })
  .validator((data: { prompt: string; mode: string }) => data)
  .handler(async ({ data }) => {
    const inventory = await fetchInventory(data.mode);

    if (data.mode === "in-closet" && inventory.length < 7) {
      throw new Error(
        `Your closet has ${inventory.length} item${inventory.length === 1 ? "" : "s"}. Add at least 7 in-closet items before generating an outfit.`,
      );
    }

    ensureRequiredSlots(inventory, data.mode);
    return { outfit: await selectOutfit(data.prompt, inventory) };
  });
