// ============================================================
//  Product services — fetch + transform
// ============================================================
import { shopifyFetch } from '../client';
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
} from '../graphql/products';
import { cursorVars } from '../pagination';
import { mapProduct, mapProductCard, paginate } from '../transforms';
import type { Paginated, Product, ProductCard } from '../types';

export interface ProductListParams {
  pageSize?: number;
  after?: string | null;
  before?: string | null;
  sortKey?: string;
  reverse?: boolean;
  query?: string | null;
}

/** Paginated storefront product list. */
export async function getProducts(
  params: ProductListParams = {},
): Promise<Paginated<ProductCard>> {
  const data = await shopifyFetch<{ products: any }>(PRODUCTS_QUERY, {
    ...cursorVars({ pageSize: params.pageSize ?? 12, after: params.after, before: params.before }),
    sortKey: params.sortKey ?? 'BEST_SELLING',
    reverse: params.reverse ?? false,
    query: params.query ?? null,
  });
  return paginate(data.products, mapProductCard);
}

/** Build a lightweight ProductCard from a full Product (for by-handle fetches). */
function productToCard(p: Product): ProductCard {
  const opts = p.options ?? [];
  const hasOnlyDefaultVariant =
    opts.length === 0 ||
    (opts.length === 1 &&
      (opts[0].optionValues?.length ?? 0) <= 1 &&
      opts[0].optionValues?.[0]?.name === 'Default Title');
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? '',
    vendor: p.vendor,
    productType: p.productType ?? '',
    tags: p.tags ?? [],
    availableForSale: p.availableForSale ?? true,
    variantId: p.variants?.[0]?.id,
    firstVariantAvailable: p.variants?.[0]?.availableForSale ?? false,
    hasOnlyDefaultVariant,
    featuredImage: p.featuredImage ?? p.images?.[0] ?? null,
    priceRange: p.priceRange,
    compareAtPriceRange: p.compareAtPriceRange,
  };
}

/**
 * Fetch a specific set of products by handle (storefront card shape), returned
 * in the SAME order as the `handles` array. Handles that don't resolve to a
 * live product are silently skipped. Used by the Product Showcase section when
 * a merchant hand-picks the exact products to feature.
 *
 * Each handle is looked up with the EXACT product(handle:) query in parallel —
 * this is reliable for every valid handle (the previous "handle:a OR handle:b"
 * search-query approach could silently drop handles due to relevance ranking
 * or search-index lag, so some selected products went missing).
 */
export async function getProductsByHandles(handles: string[]): Promise<ProductCard[]> {
  const wanted = handles.map((h) => h.trim()).filter(Boolean);
  if (wanted.length === 0) return [];

  const products = await Promise.all(wanted.map((h) => getProduct(h)));
  // Preserve the requested order; skip handles that don't resolve to a product.
  return products.filter((p): p is Product => p !== null).map(productToCard);
}

/** Full product detail by handle, or null if not found. */
export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: any | null }>(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data.product ? mapProduct(data.product) : null;
}

/** Related products for a PDP. */
export async function getProductRecommendations(
  productId: string,
  limit = 4,
): Promise<ProductCard[]> {
  const data = await shopifyFetch<{ productRecommendations: any[] | null }>(
    PRODUCT_RECOMMENDATIONS_QUERY,
    { productId },
  );
  return (data.productRecommendations ?? []).slice(0, limit).map(mapProductCard);
}
