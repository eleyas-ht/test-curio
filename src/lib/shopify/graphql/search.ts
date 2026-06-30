// ============================================================
//  Search GraphQL operations (Storefront API 2026-04)
// ============================================================
import { IMAGE_FRAGMENT, CARD_FRAGMENTS } from './fragments';

/** Full search results page (products). */
export const SEARCH_QUERY = /* GraphQL */ `
  ${CARD_FRAGMENTS}
  query Search(
    $query: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $types: [SearchType!] = [PRODUCT]
    $sortKey: SearchSortKeys = RELEVANCE
    $reverse: Boolean = false
  ) {
    search(
      query: $query
      first: $first
      last: $last
      after: $after
      before: $before
      types: $types
      sortKey: $sortKey
      reverse: $reverse
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      edges {
        node {
          ... on Product {
            ...ProductCard
          }
        }
      }
    }
  }
`;

/** Predictive (instant) search — products, collections, pages, articles + query suggestions. */
export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query PredictiveSearch(
    $query: String!
    $limit: Int = 5
    $types: [PredictiveSearchType!] = [PRODUCT, COLLECTION, QUERY, PAGE, ARTICLE]
    $limitScope: PredictiveSearchLimitScope = EACH
  ) {
    predictiveSearch(query: $query, limit: $limit, types: $types, limitScope: $limitScope) {
      queries {
        text
        styledText
      }
      products {
        id
        title
        handle
        featuredImage {
          ...ImageFields
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      collections {
        id
        title
        handle
        image {
          ...ImageFields
        }
      }
      pages {
        id
        title
        handle
      }
      articles {
        id
        title
        handle
        blog {
          handle
        }
        image {
          ...ImageFields
        }
        excerpt
      }
    }
  }
`;

/** Search for non-product content types (PAGE, ARTICLE) on the full search results page. */
export const SEARCH_CONTENT_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query SearchContent(
    $query: String!
    $first: Int = 24
    $after: String
    $types: [SearchType!]
  ) {
    search(query: $query, first: $first, after: $after, types: $types) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          __typename
          ... on Page {
            id
            title
            handle
            bodySummary
          }
          ... on Article {
            id
            title
            handle
            excerpt
            publishedAt
            blog {
              handle
              title
            }
            image {
              ...ImageFields
            }
          }
        }
      }
    }
  }
`;
