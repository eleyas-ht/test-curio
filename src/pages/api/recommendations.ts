// ============================================================
//  GET /api/recommendations[?exclude=handle1,handle2]
//  Products for the cart drawer "You May Also Like" rail.
//
//  Controlled by SITE.cartRecommendations in src/config/site.ts:
//
//  mode: 'shopify'  (default)
//    1. Products in the Shopify collection with handle
//       "cart-recommendations" (curated by the merchant in admin)
//    2. Fallback: top best-selling products store-wide
//
//  mode: 'custom'
//    Products specified by handle in SITE.cartRecommendations.handles.
//    Fetched in the order given; unavailable products are skipped.
// ============================================================
import type { APIRoute } from 'astro';
import { getCollection, getProducts, getProductsByHandles } from '~/lib/shopify';
import { SITE } from '~/config/site';
import { formatMoney } from '~/lib/utils';
import type { ProductCard } from '~/lib/shopify/types';

export const prerender = false;

const REC_COLLECTION = 'cart-recommendations';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function shape(p: ProductCard) {
  return {
    handle: p.handle,
    title: p.title,
    price: formatMoney(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode),
    image: p.featuredImage?.url ?? '',
    variantId: p.variantId,
  };
}

// Max products to return — the client decides how many to display at once;
// the remainder are accessible via the slider. Enough for any reasonable count.
const MAX_RECS = 8;

export const GET: APIRoute = async ({ url }) => {
  const exclude = new Set((url.searchParams.get('exclude') ?? '').split(',').filter(Boolean));
  const { mode, handles: configHandles } = SITE.cartRecommendations;

  try {
    if (mode === 'custom') {
      // Fetch the merchant-specified handles in order, skip missing/unavailable
      const products = await getProductsByHandles(configHandles as string[]);
      const recs = products
        .filter((p) => !exclude.has(p.handle) && p.availableForSale && p.variantId)
        .slice(0, MAX_RECS)
        .map(shape);
      return json({ recs, source: 'custom' });
    }

    // mode === 'shopify': try the curated collection first
    const col = await getCollection({ handle: REC_COLLECTION, pageSize: MAX_RECS });
    if (col) {
      const recs = col.products.items
        .filter((p) => !exclude.has(p.handle) && p.availableForSale && p.variantId)
        .slice(0, MAX_RECS)
        .map(shape);
      return json({ recs, source: 'collection' });
    }

    // Fallback: best-sellers store-wide
    const page = await getProducts({ pageSize: MAX_RECS + 4, sortKey: 'BEST_SELLING' });
    const recs = page.items
      .filter((p) => !exclude.has(p.handle) && p.availableForSale && p.variantId)
      .slice(0, MAX_RECS)
      .map(shape);
    return json({ recs, source: 'best-sellers' });
  } catch (err) {
    return json({ recs: [], error: (err as Error).message }, 500);
  }
};
