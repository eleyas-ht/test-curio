// ============================================================
//  Collection GraphQL operations (Storefront API 2026-04)
// ============================================================
import { IMAGE_FRAGMENT, MONEY_FRAGMENT, CARD_FRAGMENTS } from './fragments';

/** Single collection + its products (paginated, sortable, faceted). */
export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${CARD_FRAGMENTS}
  query CollectionByHandle(
    $handle: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductCollectionSortKeys = COLLECTION_DEFAULT
    $reverse: Boolean = false
    $filters: [ProductFilter!]
    $country: CountryCode
  ) @inContext(country: $country) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        ...ImageFields
      }
      seo {
        title
        description
      }
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges {
          cursor
          node {
            ...ProductCard
          }
        }
      }
    }
  }
`;

/** Single collection metadata + lowest product price — used by the Picks section.
 *  Fetches one product sorted by price ascending to derive the "from" price.
 *  Also reads the custom.editorial_title metafield for the editorial card headline.
 *  Set this up in Shopify Admin → Settings → Custom data → Collections → Add definition
 *  (namespace: custom, key: editorial_title, type: Single line text). */
export const COLLECTION_META_QUERY = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  query CollectionMeta($handle: String!, $country: CountryCode) @inContext(country: $country) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        ...ImageFields
      }
      editorialTitle: metafield(namespace: "custom", key: "editorial_title") {
        value
      }
      products(first: 1, sortKey: PRICE) {
        edges {
          node {
            priceRange {
              minVariantPrice {
                ...Money
              }
            }
          }
        }
      }
    }
  }
`;

// ── Departments section queries ──────────────────────────────────────────────

/**
 * All collections for the Departments section — includes productsCount so
 * the row can display "N items". Sorted by title; caller slices to limit.
 */
export const DEPT_COLLECTIONS_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query DepartmentsCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            ...ImageFields
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Single collection by handle for the Departments section — used when
 * customCollections holds a handle so specific collections can be
 * fetched in parallel.
 */
export const DEPT_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query DepartmentsCollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        ...ImageFields
      }
      products(first: 250) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

/**
 * Single collection by ID/gid for the Departments section — used when
 * customCollections holds a 'gid://shopify/Collection/...' id.
 */
export const DEPT_COLLECTION_BY_ID_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query DepartmentsCollectionById($id: ID!) {
    collection(id: $id) {
      id
      title
      handle
      description
      image {
        ...ImageFields
      }
      products(first: 250) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

/** All collections — for nav / collection index. */
export const COLLECTIONS_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  query Collections($first: Int = 50, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          description
          image {
            ...ImageFields
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  ...ImageFields
                }
              }
            }
          }
        }
      }
    }
  }
`;
