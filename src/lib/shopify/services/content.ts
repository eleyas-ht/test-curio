// ============================================================
//  Content services — menus + shop (2026-04)
// ============================================================
import { shopifyFetch } from '../client';
import { MENU_QUERY, SHOP_QUERY, PAGE_QUERY, BLOG_ARTICLES_QUERY, BLOG_LISTING_QUERY, BLOG_ARTICLE_QUERY } from '../graphql/content';
import type { BlogArticle, Menu, PageInfo, Shop } from '../types';
import { nodes } from '../transforms';

// Raw shape returned by the Shopify blog queries.
interface RawBlogResponse {
  blog: {
    title: string;
    articles: {
      pageInfo?: PageInfo;
      edges: { node: BlogArticle }[];
    };
  } | null;
}

export interface ShopifyPage {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary?: string;
  seo?: { title?: string | null; description?: string | null };
}

/** A CMS page by handle, or null if it doesn't exist. */
export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>(PAGE_QUERY, { handle });
  return data.page ?? null;
}

/** Navigation menu by handle (e.g. "main-menu", "footer"). Null if missing. */
export async function getMenu(handle: string): Promise<Menu | null> {
  const data = await shopifyFetch<{ menu: Menu | null }>(MENU_QUERY, { handle });
  return data.menu ?? null;
}

/** Shop name + primary domain. */
export async function getShop(): Promise<Shop> {
  const data = await shopifyFetch<{ shop: Shop }>(SHOP_QUERY);
  return data.shop;
}

/**
 * Fetch the latest articles from a Shopify blog.
 * Returns an empty array if the blog handle doesn't exist.
 *
 * @param blogHandle - Blog handle from Shopify admin (e.g. "news", "journal").
 * @param count      - Maximum number of articles to return (default: 3).
 */
export async function getBlogArticles(blogHandle: string, count = 3): Promise<BlogArticle[]> {
  const data = await shopifyFetch<RawBlogResponse>(
    BLOG_ARTICLES_QUERY,
    { handle: blogHandle, first: count },
  );
  if (!data.blog) return [];
  return nodes(data.blog.articles) as BlogArticle[];
}

/**
 * Fetch a paginated blog listing (title + articles).
 * Used by the /blogs/[blog] listing page.
 */
export async function getBlogListing(
  blogHandle: string,
  count = 12,
  after?: string,
): Promise<{ title: string; articles: BlogArticle[]; pageInfo: PageInfo } | null> {
  const data = await shopifyFetch<RawBlogResponse>(
    BLOG_LISTING_QUERY,
    { handle: blogHandle, first: count, after: after ?? null },
  );
  if (!data.blog) return null;
  return {
    title: data.blog.title,
    articles: nodes(data.blog.articles) as BlogArticle[],
    pageInfo: data.blog.articles.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
}

/**
 * Fetch a single blog article by blog handle + article handle.
 * Used by the /blogs/[blog]/[article] detail page.
 * Returns null when either the blog or article doesn't exist.
 */
export async function getArticle(
  blogHandle: string,
  articleHandle: string,
): Promise<{ blogTitle: string; article: BlogArticle } | null> {
  const data = await shopifyFetch<{
    blog: { title: string; articleByHandle: BlogArticle | null } | null;
  }>(BLOG_ARTICLE_QUERY, { blogHandle, articleHandle });
  if (!data.blog?.articleByHandle) return null;
  return { blogTitle: data.blog.title, article: data.blog.articleByHandle };
}
