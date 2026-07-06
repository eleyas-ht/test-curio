// ============================================================
//  Buyer IP — shared by every Storefront API caller (products,
//  collections, search, cart). Forwarding the same buyer IP on
//  every request lets Shopify resolve the same Market/currency
//  consistently across the whole storefront for a given visitor.
// ============================================================

/**
 * The buyer's IP, forwarded to Shopify for market/currency resolution,
 * tax/duty estimation, and fraud signals. On Cloudflare Workers
 * `Astro.clientAddress` throws, so we read the IP from the edge headers
 * instead (CF-Connecting-IP, then XFF).
 */
export function buyerIpFrom(request: Request): string | undefined {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    undefined
  );
}
