import { createServerFn } from "@tanstack/react-start";

const AWS_API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;

const OUTFIT_SLOTS = ["Top", "Bottom", "Footwear", "Accessory"] as const;
const REQUIRED_BASE_SLOTS = ["Top", "Bottom", "Footwear"] as const;
const MAX_OUTFIT_ITEMS = 6;
type OutfitSlot = (typeof OUTFIT_SLOTS)[number];

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
  return OUTFIT_SLOTS.includes(value as OutfitSlot) ? (value as OutfitSlot) : undefined;
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
  const missing = REQUIRED_BASE_SLOTS.filter(
    (slot) => !inventory.some((item) => item.slot === slot),
  );
  if (missing.length === 0) return;

  const scope = mode === "in-closet" ? "your in-closet wardrobe" : "the wardrobe inventory";
  throw new Error(
    `${scope} is missing: ${missing.join(", ")}. Add those items before generating a complete outfit.`,
  );
}

function getApiErrorDetails(body: string) {
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

function getAnalyzeEndpoint(): string {
  if (!AWS_API_GATEWAY_URL) {
    throw new Error("Wardrobe inventory service is not configured.");
  }

  const endpoint = new URL(AWS_API_GATEWAY_URL);
  const pathParts = endpoint.pathname.split("/");
  pathParts[pathParts.length - 1] = "analyze";
  endpoint.pathname = pathParts.join("/");
  return endpoint.toString();
}

async function selectOutfit(prompt: string, inventory: InventoryItem[]): Promise<OutfitItem[]> {
  const registry = inventory.map(({ id, slot, title, vibe }) => ({ id, slot, title, vibe }));

  let response: Response;
  try {
    response = await fetch(getAnalyzeEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "outfit-generation",
        prompt,
        registry,
      }),
    });
  } catch (error) {
    console.error("Outfit generation API request could not be sent", {
      message: error instanceof Error ? error.message : String(error),
    });
    throw new Error("The styling service is temporarily unavailable. Please try again.");
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("Outfit generation API request failed", {
      status: response.status,
      statusText: response.statusText,
      error: getApiErrorDetails(body),
    });
    throw new Error("The styling service is temporarily unavailable. Please try again.");
  }

  const payload: unknown = await response.json();
  const selections = isRecord(payload) && Array.isArray(payload.outfit) ? payload.outfit : payload;

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
  const ids = resolved.map((item) => item.id);
  if (
    resolved.length < REQUIRED_BASE_SLOTS.length ||
    resolved.length > MAX_OUTFIT_ITEMS ||
    new Set(ids).size !== ids.length ||
    REQUIRED_BASE_SLOTS.some((slot) => !slots.includes(slot))
  ) {
    throw new Error("The styling service did not create a complete outfit. Please try again.");
  }

  return resolved.map(({ slot, title, vibe, image }) => ({ slot, title, vibe, image }));
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
