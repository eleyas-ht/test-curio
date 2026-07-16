// ============================================================
//  Product Showcase Section Configuration
//
//  The Showcase is the full-bleed "Most Demanding" hero spread on
//  the home page. As the visitor scrolls *inside* the section, the
//  featured product switches with a cross-fade — exactly like the
//  static HTML reference. When the first/last product is reached the
//  page releases and scrolls on to the next section.
//
//  Two product sources (set via `mode`):
//
//  'shopify'  → pull live products straight from the Shopify
//               Storefront API. Hand-pick the exact products to
//               feature by listing their handles. ← recommended
//
//  'custom'   → manually defined slides (image, title, description,
//               link, price). No Shopify API call — works exactly
//               like the Picks section's custom mode. Use this when
//               you want full control over the imagery/copy or have
//               no Shopify catalogue wired up yet.
//
//  Everything below is one self-contained config object. Edit the
//  values; the section re-renders accordingly. Nothing here changes
//  the design/layout — only the content and behaviour knobs.
// ============================================================

import { imgUrl } from '~/lib/assets';

export type ShowcaseMode = 'shopify' | 'custom';

// ── Custom slide shape (used when mode === 'custom') ─────────────────────────
export interface ShowcaseCustomItem {
  image: string;        // product image — path relative to /public, e.g. '/images/most-demand-01.png'
  imageAlt: string;     // alt text for accessibility
  kicker: string;       // small ALL-CAPS label above the title (e.g. 'Portable Speaker')
  title: string;        // product title; wrap a word in *asterisks* for the italic clay accent → *Mini*
  description: string;  // supporting copy under the title
  href: string;         // "View Details" link destination (usually a product page)
  price?: number;       // optional — raw amount, e.g. 199. Formatted in the visitor's
                        //   live currency (same market currency as every Shopify price
                        //   on the page). Omit to hide the price line.
}

// ── Shopify source options (used when mode === 'shopify') ────────────────────
export interface ShowcaseShopifyConfig {
  // ─── Product selection ──────────────────────────────────────────────────
  // The exact products to feature, BY HANDLE, in display order.
  // Find a handle in Shopify Admin → Products → <product> → URL handle field
  // (e.g. /products/beatcore-mini → handle is 'beatcore-mini').
  productHandles: string[];

  // ─── Number of products to display ──────────────────────────────────────
  // Caps how many of the handles above are shown in the scroll sequence.
  // (If you list more handles than this, the rest are ignored.)
  productLimit: number;

  // ─── Description truncation ─────────────────────────────────────────────
  // Trims each product's Shopify description so slides stay balanced.
  // descriptionLength: cutoff number (characters or words). 0 = hide descriptions.
  // descriptionUnit:   'chars' (tight, fixed-width) | 'words' (natural breaks).
  descriptionLength: number;
  descriptionUnit: 'chars' | 'words';

  // ─── Kicker labels ──────────────────────────────────────────────────────
  // The small ALL-CAPS label above each product title.
  // Map a product handle → custom label to override individual slides.
  // Example: { 'beatcore-mini': 'Portable Speaker' }
  kickers: Record<string, string>;

  // ─── Kicker fallback ────────────────────────────────────────────────────
  // Used when a product has no entry in `kickers` above.
  // 'product-type' → the product's Type field (Shopify Admin → Products → Type)
  // 'vendor'       → the product's Vendor/brand
  // 'none'         → no kicker shown
  kickerFallback: 'product-type' | 'vendor' | 'none';
}

// ── Behaviour / animation settings (apply to BOTH modes) ─────────────────────
export interface ShowcaseSettings {
  // ─── Background watermark ───────────────────────────────────────────────
  // The giant scrolling word behind the product. Set to '' to hide it.
  watermark: string;

  // ─── Scroll length per product (pin duration) ───────────────────────────
  // The section PINS in the viewport and the featured product switches as the
  // user scrolls — the section only scrolls away once every product has been
  // shown. This controls how much scrolling each product gets, measured in
  // viewport-heights (1 = one full screen of scroll per product).
  //   Higher → slower switching / the section stays pinned longer.
  //   Lower  → snappier switching / shorter pin.
  // Recommended range: 0.6 – 1.2.
  scrollPerProductVh: number;

  // ─── Cross-fade animation ───────────────────────────────────────────────
  // fadeDuration: ms for the out→in image/text cross-fade between products.
  //               Keep in sync with the CSS transition for the cleanest result.
  //               (HTML default: 700)
  fadeDuration: number;

  // ─── Description length limit (optional, applies to both modes) ──────────
  // In 'shopify' mode this is set per-product via descriptionLength above; this
  // global limit additionally caps CUSTOM slide descriptions. 0 = no limit.
  customDescriptionLimit: number;
}

export interface ShowcaseConfig {
  // ─── Source selector ────────────────────────────────────────────────────
  // 'shopify' → uses shopifyConfig + live Storefront products
  // 'custom'  → uses customItems (no API call)
  mode: ShowcaseMode;

  shopifyConfig: ShowcaseShopifyConfig;
  customItems: ShowcaseCustomItem[];
  settings: ShowcaseSettings;
}

// ============================================================
//  Home page Showcase instance
// ============================================================
export const SHOWCASE: ShowcaseConfig = {
  mode: 'custom', // ← 'shopify' | 'custom'

  // ── Shopify source (used when mode === 'shopify') ──────────────────────────
  shopifyConfig: {
    // Hand-picked products, in the order they appear while scrolling.
    productHandles: [
      'kb-phone-15-pro',
      'network-bridges-x1',
      'packbook-pro-15inch',
    ],

    // Show at most this many of the handles above.
    productLimit: 4,

    // Trim long Shopify descriptions to keep slides tidy. 0 = hide descriptions.
    descriptionLength: 140,
    descriptionUnit: 'chars', // 'chars' | 'words'

    // Per-handle kicker overrides; falls back to the rule below when absent.
    kickers: {},

    // Kicker shown when a product has no override above.
    kickerFallback: 'product-type', // 'product-type' | 'vendor' | 'none'
  },

  // ── Custom slides (used when mode === 'custom') ────────────────────────────
  //  Mirrors the HTML reference's four "Most Demanding" products 1:1.
  customItems: [
    {
      // Slide 1 ────────────────────────────────────────────────────────────
      image: imgUrl('/images/most-demand-01.png'),
      imageAlt: 'BeatCore Mini portable speaker',
      kicker: 'Portable Speaker',
      title: 'BeatCore *Mini*', // *Mini* → italic clay accent
      description:
        '360° room-filling sound in a compact, waterproof body. 24-hour playtime with instant one-tap pairing.',
      href: '/products/zackpot-speaker',
      price: 95.50,
    },
    {
      // Slide 2 ────────────────────────────────────────────────────────────
      image: imgUrl('/images/most-demand-02.png'),
      imageAlt: 'FlexFold Pro flip smartphone',
      kicker: 'Flip Smartphone',
      title: 'FlexFold *Pro*',
      description:
        'Flagship flip phone with Hasselblad co-engineered triple camera, 6.9" AMOLED display, and all-day battery.',
      href: '/products/nexphone-fold-x',
      price: 550.52,
    },
    {
      // Slide 3 ────────────────────────────────────────────────────────────
      image: imgUrl('/images/most-demand-03.png'),
      imageAlt: 'AuraBuds Air wireless earbuds',
      kicker: 'Wireless Earbuds',
      title: 'AuraBuds *Air*',
      description:
        'True wireless earbuds with adaptive ANC, ambient RGB lighting, and 36 hours of total battery life.',
      href: '/products/sports-wireless-earbuds',
      price: 310,
    },
    {
      // Slide 4 ────────────────────────────────────────────────────────────
      image: imgUrl('/images/most-demand-04.png'),
      imageAlt: 'ChronoX Sport smartwatch',
      kicker: 'Smartwatch',
      title: 'ChronoX *Sport*',
      description:
        'Round AMOLED smartwatch with built-in GPS, heart rate & SpO2 tracking, and a 7-day battery life.',
      href: '/products/network-bridges-x1',
      price: 210,
    },
  ],

  // ── Behaviour & animation (applies to both modes) ──────────────────────────
  settings: {
    watermark: 'Most Demanding', // giant background word; '' to hide
    scrollPerProductVh: 0.9,     // viewport-heights of scroll per product (pin duration); higher = slower
    fadeDuration: 700,           // ms cross-fade between products (match the CSS)
    customDescriptionLimit: 0,   // cap custom slide descriptions; 0 = no limit
  },
};
