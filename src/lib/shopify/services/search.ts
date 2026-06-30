// ============================================================
//  Search services — full + predictive (2026-04)
// ============================================================
import { shopifyFetch } from '../client';
import { SEARCH_QUERY, PREDICTIVE_SEARCH_QUERY, SEARCH_CONTENT_QUERY } from '../graphql/search';
import { cursorVars } from '../pagination';
import { mapProductCard, paginate } from '../transforms';
import type { Paginated, ProductCard } from '../types';

export interface SearchParams {
  query: string;
  pageSize?: number;
  after?: string | null;
  before?: string | null;
  sortKey?: string;
  reverse?: boolean;
}

export interface SearchResult extends Paginated<ProductCard> {
  totalCount: number;
}

/** Full product search results page. */
export async function searchProducts(params: SearchParams): Promise<SearchResult> {
  const data = await shopifyFetch<{ search: any }>(SEARCH_QUERY, {
    query: params.query,
    ...cursorVars({ pageSize: params.pageSize ?? 24, after: params.after, before: params.before }),
    sortKey: params.sortKey ?? 'RELEVANCE',
    reverse: params.reverse ?? false,
    types: ['PRODUCT'],
  });
  const page = paginate<any, ProductCard>(data.search, mapProductCard);
  return { ...page, totalCount: data.search?.totalCount ?? page.items.length };
}

// ── Predictive search ─────────────────────────────────────

export interface PredictiveResult {
  queries: { text: string; styledText: string }[];
  products: Array<{
    id: string;
    title: string;
    handle: string;
    featuredImage?: { url: string; altText?: string | null } | null;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  }>;
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    image?: { url: string; altText?: string | null } | null;
  }>;
  pages: Array<{
    id: string;
    title: string;
    handle: string;
  }>;
  articles: Array<{
    id: string;
    title: string;
    handle: string;
    blog: { handle: string };
    image?: { url: string; altText?: string | null } | null;
    excerpt?: string | null;
  }>;
}

/** Instant search for the header autocomplete — products, collections, pages, articles, suggestions. */
export async function predictiveSearch(query: string): Promise<PredictiveResult> {
  const data = await shopifyFetch<{ predictiveSearch: any }>(PREDICTIVE_SEARCH_QUERY, { query });
  return {
    queries: data.predictiveSearch?.queries ?? [],
    products: data.predictiveSearch?.products ?? [],
    collections: data.predictiveSearch?.collections ?? [],
    pages: data.predictiveSearch?.pages ?? [],
    articles: data.predictiveSearch?.articles ?? [],
  };
}

// ── Content search (pages + articles) ────────────────────

export interface PageResult {
  id: string;
  title: string;
  handle: string;
  bodySummary?: string;
}

export interface ArticleResult {
  id: string;
  title: string;
  handle: string;
  excerpt?: string | null;
  publishedAt?: string;
  blog: { handle: string; title: string };
  image?: { url: string; altText?: string | null } | null;
}

export interface ContentSearchResult<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor?: string | null;
}

/** Search pages or articles. Pass `type: 'PAGE'` or `type: 'ARTICLE'`. */
export async function searchContent<T extends PageResult | ArticleResult>(
  params: SearchParams & { type: 'PAGE' | 'ARTICLE' },
): Promise<ContentSearchResult<T>> {
  const data = await shopifyFetch<{ search: any }>(SEARCH_CONTENT_QUERY, {
    query: params.query,
    first: params.pageSize ?? 24,
    after: params.after ?? undefined,
    types: [params.type],
  });
  const edges = data.search?.edges ?? [];
  const items = edges.map((e: any) => e.node).filter(Boolean) as T[];
  return {
    items,
    totalCount: data.search?.totalCount ?? items.length,
    hasNextPage: data.search?.pageInfo?.hasNextPage ?? false,
    endCursor: data.search?.pageInfo?.endCursor ?? null,
  };
}
