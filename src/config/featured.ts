// ============================================================
//  Featured Section Configuration
//
//  Two modes (set via `mode`):
//
//  'collection-tabs' → each tab fetches products from a Shopify
//    collection handle. Switching tabs shows a different product
//    grid without a page reload. This is the recommended mode.
//
//  'product-type' → original behaviour: fetches best-selling
//    products and generates tabs from their productType field.
//    No per-tab collection handles; the source is always the
//    global best-sellers list.
//
// ============================================================

export interface FeaturedTabConfig {
  // Shopify collection handle, e.g. 'new-arrivals', 'best-sellers'.
  // Find it in Shopify Admin → Products → Collections → handle field.
  // Not required when isAllTab is true.
  collectionHandle?: string;

  // Optional display label for the tab button.
  // When omitted the collection title from Shopify is used.
  customName?: string;

  // How many products to show initially before the Load More button.
  // Defaults to the top-level `productLimit` when not set here.
  productLimit?: number;

  // Total products to fetch from Shopify for this tab. Must be >= productLimit.
  // The excess products are rendered but hidden; Load More reveals them.
  // Defaults to the top-level `fetchLimit` when not set here.
  fetchLimit?: number;

  // When true this tab shows a deduplicated union of every other tab's
  // products. No collectionHandle is needed. Typically used for an "All" tab.
  isAllTab?: boolean;
}

export interface FeaturedConfig {
  mode: 'collection-tabs' | 'product-type';

  // ── collection-tabs ────────────────────────────────────────
  // Ordered list of tabs. Each tab maps to one Shopify collection.
  // Add, remove, or reorder entries freely (the first tab is
  // shown by default).
  collectionTabs: FeaturedTabConfig[];

  // How many products to show initially per tab (before Load More).
  productLimit: number;

  // Total products to fetch from Shopify per tab. Must be >= productLimit.
  // Sets the ceiling for Load More. Defaults to productLimit (no Load More).
  fetchLimit: number;

  // ── Section copy ───────────────────────────────────────────
  label: string;  // eyebrow chip above the heading
  title: string;  // main heading — wrap a word in *asterisks* for italic accent
}

export const FEATURED: FeaturedConfig = {
  mode: 'collection-tabs',

  collectionTabs: [
    // First tab is active on page load. Add more tabs as needed.
    { isAllTab: true, customName: 'All' },
    { collectionHandle: 'accessories' },          // name comes from Shopify
    { collectionHandle: 'phone-tablet' },
    { collectionHandle: 'pc-laptop' },
    { collectionHandle: 'sale' },
    // { collectionHandle: 'sale', customName: 'On Sale', productLimit: 6 },
  ],

  productLimit: 8,
  fetchLimit: 24,

  label: "This Season's Selection",
  title: 'Curated, not *catalogued*.',
};
