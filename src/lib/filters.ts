// ============================================================
//  Collection filter helpers (CONVERSION-PLAN.md §5.1).
//  Shopify returns each facet value's `input` as a JSON-encoded
//  ProductFilter. We round-trip it through the URL as a base64url
//  token (`?f=…`) so the filter panel is server-rendered, shareable
//  and back-button-safe — no client state needed.
// ============================================================

/** Encode a facet value's raw `input` JSON string → URL-safe token. */
export function encodeFilter(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

/** Decode a `?f=` token back into a ProductFilter object (or null). */
export function decodeFilter(token: string): unknown | null {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/** Build the `[ProductFilter!]` array to send to getCollection() from the URL. */
export function parseFilters(url: URL): unknown[] {
  const filters: unknown[] = [];
  for (const token of url.searchParams.getAll('f')) {
    const value = decodeFilter(token);
    if (value) filters.push(value);
  }
  // Price range from the slider/number inputs.
  const min = url.searchParams.get('price_min');
  const max = url.searchParams.get('price_max');
  if (min || max) {
    const price: { min?: number; max?: number } = {};
    if (min && Number.isFinite(Number(min))) price.min = Number(min);
    if (max && Number.isFinite(Number(max))) price.max = Number(max);
    if (Object.keys(price).length) filters.push({ price });
  }
  return filters;
}

/** Set of currently-selected `?f=` tokens, for marking checkboxes. */
export function selectedTokens(url: URL): Set<string> {
  return new Set(url.searchParams.getAll('f'));
}

/** How many facets are active (for the "Filters (N)" badge). */
export function activeFilterCount(url: URL): number {
  const f = url.searchParams.getAll('f').length;
  const price = url.searchParams.get('price_min') || url.searchParams.get('price_max') ? 1 : 0;
  return f + price;
}
