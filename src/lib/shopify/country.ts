// ============================================================
//  Visitor country — resolves the ISO 3166-1 alpha-2 country code
//  used to drive `@inContext(country: $country)` on every Storefront
//  API query/mutation, so Shopify Markets resolve the same currency
//  for a visitor across products, collections, search, and cart.
// ============================================================

/** Shopify's CountryCode enum has no "unknown" value; these are never valid. */
const INVALID_CODES = new Set(['XX', 'T1']);

/** Read an env var from build-time inline (dev) or runtime process.env (prod node). */
function env(key: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[key];
  if (meta) return meta;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

/**
 * Fallback country when no edge geolocation header is present (e.g. hosting
 * without Cloudflare/Vercel in front, or a direct/non-edge request). Without
 * this, a query that still declares `@inContext(country: $country)` with no
 * value resolves against the *server's own* outbound IP instead of a
 * sensible default — meaningless in a serverless/edge context. Configurable
 * via SHOPIFY_DEFAULT_COUNTRY; defaults to the shop's home market.
 */
const DEFAULT_COUNTRY = env('SHOPIFY_DEFAULT_COUNTRY') || 'BD';

/**
 * The visitor's country, from the edge-injected `CF-IPCountry` header
 * (Cloudflare Pages/Workers populate this automatically — no external
 * geo-IP lookup needed). Falls back to `x-vercel-ip-country` for parity
 * on Vercel, then to `DEFAULT_COUNTRY` so `@inContext` always resolves a
 * deliberate market instead of an accidental one.
 */
export function countryFrom(request: Request): string {
  const code = (
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    ''
  ).toUpperCase();
  return code && !INVALID_CODES.has(code) ? code : DEFAULT_COUNTRY;
}
