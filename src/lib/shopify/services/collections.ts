// ============================================================
//  Collection services — fetch + transform
// ============================================================
import { shopifyFetch } from '../client';
import {
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTION_META_QUERY,
  COLLECTIONS_QUERY,
  DEPT_COLLECTIONS_QUERY,
  DEPT_COLLECTION_BY_HANDLE_QUERY,
  DEPT_COLLECTION_BY_ID_QUERY,
} from '../graphql/collections';
import { cursorVars } from '../pagination';
import { mapCollection, mapProductCard, paginate } from '../transforms';
import type { Collection, CollectionWithProducts } from '../types';

export interface CollectionParams {
  handle: string;
  pageSize?: number;
  after?: string | null;
  before?: string | null;
  sortKey?: string;
  reverse?: boolean;
  filters?: unknown[];
}

/** A collection with one page of its products, or null if not found. */
export async function getCollection(
  params: CollectionParams,
): Promise<CollectionWithProducts | null> {
  const data = await shopifyFetch<{ collection: any | null }>(COLLECTION_BY_HANDLE_QUERY, {
    handle: params.handle,
    ...cursorVars({ pageSize: params.pageSize ?? 12, after: params.after, before: params.before }),
    sortKey: params.sortKey ?? 'COLLECTION_DEFAULT',
    reverse: params.reverse ?? false,
    filters: params.filters ?? null,
  });
  if (!data.collection) return null;

  const products = paginate(data.collection.products, mapProductCard);
  return {
    ...mapCollection(data.collection),
    products,
    filters: data.collection.products?.filters ?? [],
  };
}

/** Every collection — for the nav and collection index. */
export async function getAllCollections(first = 50): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: any }>(COLLECTIONS_QUERY, { first });
  return (data.collections?.edges ?? []).map((e: any) => mapCollection(e.node));
}

/**
 * Fetch products from a collection for the Picks section.
 * Returns the collection title (used as kicker fallback) and the product list.
 * Returns null when the collection handle does not exist.
 */
export async function getPicksProducts(
  handle: string,
  limit = 6,
): Promise<{ collectionTitle: string; products: import('../types').ProductCard[] } | null> {
  const col = await getCollection({ handle, pageSize: limit });
  if (!col) return null;
  return {
    collectionTitle: col.title,
    products: col.products.items,
  };
}

/** Lightweight metadata fetch (no products) for a single collection handle. Returns null if not found. */
export async function getCollectionMeta(handle: string): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: any | null }>(COLLECTION_META_QUERY, { handle });
  if (!data.collection) return null;
  return mapCollection(data.collection);
}

/**
 * Fetch metadata for multiple collection handles in parallel.
 * Skips handles that resolve to null (collection not found).
 */
export async function getCollectionsByHandles(handles: string[]): Promise<Collection[]> {
  const results = await Promise.all(handles.map((h) => getCollectionMeta(h)));
  return results.filter((c): c is Collection => c !== null);
}

// ── Departments section ──────────────────────────────────────────────────────

/**
 * Fetch collections for the Departments section — includes product count.
 *
 * When `selectors` is provided and non-empty, only those specific collections
 * are fetched (in the order given), up to `limit`. Each selector may be a
 * collection HANDLE (e.g. 'headphones') or an ID/gid (e.g.
 * 'gid://shopify/Collection/123') — the form is auto-detected. When
 * `selectors` is omitted or empty, ALL collections are fetched (up to `limit`,
 * sorted A→Z by Shopify).
 */
export async function getDepartmentsCollections(opts: {
  /** Maximum number of collections to return. */
  limit: number;
  /** Specific collection handles and/or IDs to show, in order. Leave empty for all. */
  selectors?: string[];
}): Promise<Collection[]> {
  const { limit, selectors } = opts;

  if (selectors && selectors.length > 0) {
    // Fetch specific collections in parallel, preserving the requested order.
    // A 'gid://' prefix means it's an ID; otherwise treat it as a handle.
    const results = await Promise.all(
      selectors.slice(0, limit).map(async (selector) => {
        const isId = selector.startsWith('gid://');
        const data = await shopifyFetch<{ collection: any | null }>(
          isId ? DEPT_COLLECTION_BY_ID_QUERY : DEPT_COLLECTION_BY_HANDLE_QUERY,
          isId ? { id: selector } : { handle: selector },
        );
        return data.collection ? mapCollection(data.collection) : null;
      }),
    );
    return results.filter((c): c is Collection => c !== null);
  }

  // Fetch all collections up to limit (Shopify returns them A→Z).
  const data = await shopifyFetch<{ collections: any }>(DEPT_COLLECTIONS_QUERY, { first: limit });
  return (data.collections?.edges ?? []).map((e: any) => mapCollection(e.node));
}
