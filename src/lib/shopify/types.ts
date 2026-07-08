// ============================================================
//  Shopify Storefront API — flattened domain types (2026-04)
// ============================================================
// These describe the *clean* shapes our transforms produce, not
// the raw edges/node GraphQL envelopes.

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice?: Money | null;
  image?: Image | null;
}

export interface ProductOptionValue {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
  optionValues: ProductOptionValue[];
}

export interface Seo {
  title?: string | null;
  description?: string | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  availableForSale: boolean;
  featuredImage?: Image | null;
  images: Image[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
  };
  options: ProductOption[];
  variants: ProductVariant[];
  seo?: Seo;
  /** Aggregate star rating from the Shopify Product Reviews metafield. */
  rating?: number | null;
  ratingCount?: number | null;
  /** Key highlights bullet list from the custom.highlights metafield. */
  highlights?: string[];
}

/** Lightweight product shape used in grids/cards. */
export interface ProductCard {
  id: string;
  title: string;
  handle: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  availableForSale: boolean;
  /** First variant id — enough for quick "add to cart" from a grid card. */
  variantId?: string;
  /** Whether the first variant is available (drives quick-add vs. PDP redirect). */
  firstVariantAvailable: boolean;
  /** True when the product has no real options (only the synthetic "Default Title" variant). */
  hasOnlyDefaultVariant: boolean;
  featuredImage?: Image | null;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
  };
  /** Aggregate star rating from the Shopify Product Reviews metafield (reviews.rating). */
  rating?: number | null;
  /** Number of reviews from the reviews.rating_count metafield. */
  ratingCount?: number | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

/** A flattened paginated list. */
export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface CollectionFilterValue {
  id: string;
  label: string;
  count: number;
  input: string;
}

export interface CollectionFilter {
  id: string;
  label: string;
  type: string;
  values: CollectionFilterValue[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  image?: Image | null;
  seo?: Seo;
  /** Lowest variant price across all products in the collection. Only populated
   *  when the query requests it (e.g. COLLECTION_META_QUERY for Picks). */
  minPrice?: Money | null;
  /** Editorial headline from the custom.editorial_title metafield. Falls back to
   *  title in the Picks component when absent. Only populated by COLLECTION_META_QUERY. */
  editorialTitle?: string | null;
  /** Total number of products in the collection. Only populated when the query
   *  requests productsCount (e.g. DEPT_COLLECTION_QUERY for the Departments section). */
  productCount?: number | null;
  /** Featured image of the first product in the collection. Used as a fallback
   *  when the collection has no dedicated image. Only populated by COLLECTIONS_QUERY. */
  firstProductImage?: Image | null;
}

export interface CollectionWithProducts extends Collection {
  products: Paginated<ProductCard>;
  filters?: CollectionFilter[];
}

// ── Cart ────────────────────────────────────────────────────

export interface CartLineMerchandise {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  image?: Image | null;
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: Image | null;
  };
}

export interface CartDiscountAllocation {
  discountedAmount: Money;
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
  };
  /** Per-line savings from applied discount codes or automatic discounts. */
  discountAllocations: CartDiscountAllocation[];
  /** Custom key/value pairs stored on the line (e.g. _bundleDiscount: "10"). */
  attributes: { key: string; value: string }[];
  merchandise: CartLineMerchandise;
}

export interface CartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note?: string | null;
  buyerIdentity?: { email?: string | null; customer?: { id: string } | null } | null;
  discountCodes: CartDiscountCode[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
}

// ── Navigation / content ────────────────────────────────────

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: string;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface Shop {
  name: string;
  description?: string;
  primaryDomain: { url: string; host: string };
}

// ── Blog / Journal ──────────────────────────────────────────

export interface BlogArticle {
  id: string;
  title: string;
  handle: string;
  /** Plain-text excerpt. Null when no summary is set in Shopify admin. */
  excerpt?: string | null;
  /** Full article body as HTML — used as excerpt fallback and on the detail page. */
  contentHtml?: string | null;
  publishedAt: string;
  /** Author object — absent on older articles that predate the author field. */
  author?: { name: string } | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  /** Parent blog — used to construct the article URL and on listing/detail pages. */
  blog: { handle: string; title?: string };
  /** Tags — the first tag is used as the category chip. */
  tags: string[];
  seo?: { title?: string | null; description?: string | null };
}

// ── Sort options surfaced in the UI ─────────────────────────

export interface SortOption {
  label: string;
  value: string;
  sortKey: string;
  reverse: boolean;
}
