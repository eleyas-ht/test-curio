// ============================================================
//  Content GraphQL operations — menus, shop, blogs (2026-04)
// ============================================================

/** Navigation menu by handle (e.g. "main-menu", "footer"); nests 3 levels. */
export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      items {
        id
        title
        url
        type
        items {
          id
          title
          url
          type
          items {
            id
            title
            url
            type
          }
        }
      }
    }
  }
`;

/** Shop name + primary domain — for SEO and footer. */
export const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
    }
  }
`;

// Shared article fields fragment used by blog queries.
const ARTICLE_FIELDS = /* GraphQL */ `
  id
  title
  handle
  excerpt
  contentHtml
  publishedAt
  author {
    name
  }
  image {
    url
    altText
    width
    height
  }
  blog {
    handle
    title
  }
  tags
  seo {
    title
    description
  }
`;

/**
 * Latest articles from a blog by handle (e.g. "news", "journal").
 * Returns up to `$first` articles sorted by published date descending.
 * Fetches `contentHtml` so the Journal component can derive an excerpt
 * fallback for articles that have no explicit summary set.
 */
export const BLOG_ARTICLES_QUERY = /* GraphQL */ `
  query BlogArticles($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      title
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            ${ARTICLE_FIELDS}
          }
        }
      }
    }
  }
`;

/**
 * Blog listing page — blog title + paginated articles.
 * Returns up to `$first` articles starting after `$after` cursor.
 */
export const BLOG_LISTING_QUERY = /* GraphQL */ `
  query BlogListing($handle: String!, $first: Int!, $after: String) {
    blog(handle: $handle) {
      title
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ${ARTICLE_FIELDS}
          }
        }
      }
    }
  }
`;

/**
 * Single blog article by blog handle + article handle.
 * Used by the article detail page /blogs/[blog]/[article].
 */
export const BLOG_ARTICLE_QUERY = /* GraphQL */ `
  query BlogArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      title
      articleByHandle(handle: $articleHandle) {
        ${ARTICLE_FIELDS}
      }
    }
  }
`;

/** A CMS page by handle (about, shipping, etc.). */
export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`;
