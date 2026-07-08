// ============================================================
//  Shared data shapes for the Curated Bundle section.
//
//  Produced server-side by Bundle.astro (Shopify fetch or static
//  config) and consumed by BundleSection.astro + bundle-render.ts.
//  These used to live in the React island; kept identical so the
//  SSR wrapper's mapping logic is unchanged.
// ============================================================

export interface BundleVariant {
  /** Shopify variant GID — e.g. gid://shopify/ProductVariant/123 */
  id: string;
  /** Combined option label, e.g. "Black / Large". "Default Title" for simple products. */
  title: string;
  /** Numeric price in store currency (parsed from Storefront Money.amount). */
  price: number;
  /** Numeric compare-at price; undefined when not set. */
  compareAtPrice?: number;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  /** Variant-specific image URL; falls back to product image when absent. */
  imageUrl?: string;
}

export interface BundleItemData {
  // Shopify fields (only populated in shopify mode)
  shopifyId?: string;
  handle?: string;
  variants?: BundleVariant[];
  hasOnlyDefaultVariant?: boolean;
  availableForSale?: boolean;
  // Display fields (both modes)
  image: string;
  imageAlt?: string;
  name: string;
  description: string;
  /** Base display price (first variant price in shopify mode; config price in custom mode). */
  price: number;
  compareAtPrice?: number;
}

export interface BundleSlideData {
  label: string;
  /** May contain <em> tags — rendered as raw HTML (config-controlled, safe). */
  title: string;
  intro: string;
  heroImage: string;
  discount: number;
  ctaText: string;
  /** True when products carry real Shopify variant IDs that can be added to cart. */
  isShopifyMode: boolean;
  /**
   * Shopify discount code to apply when the full bundle is added to cart.
   * Merged with any code the shopper already entered — existing codes are kept.
   * Create this code in Shopify Admin → Discounts with the matching percentage.
   */
  discountCode?: string;
  /** ISO 4217 currency code for all prices in this slide (e.g. "USD", "EUR"). */
  currencyCode: string;
  items: BundleItemData[];
}
