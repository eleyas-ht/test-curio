import { imgUrl } from '~/lib/assets';

﻿// ============================================================
//  Picks Section Configuration
//
//  PICKS is an array — each element is one independent section
//  instance. They render in order on the page.
//  Add, remove, or reorder elements freely.
//
//  Three modes (set per instance via `mode`):
//
//  'products'    → fetches live products from a Shopify collection.
//                  Each card shows product image, title, description,
//                  price, and a Shop link. ← the primary/recommended mode
//
//  'collections' → fetches collection metadata cards (image, title,
//                  description from the collection itself, not its products).
//
//  'custom'      → manually defined cards; no Shopify API call.
//
//  Every instance is completely self-contained — changes to one
//  do not affect any other instance.
//
//  Using Picks on other pages
//  ──────────────────────────
//  The <Picks> component is stateless and works on any page.
//  1. import Picks from '~/components/home/sections/Picks.astro';
//  2. import { getPicksProducts } from '~/lib/shopify';
//  3. const data = await getPicksProducts('your-handle', 3);
//  4. <Picks mode="products" productsData={data} productsConfig={...} ... />
//
// ============================================================

export type PicksLayout = '2-col' | '3-col' | '4-col';
export type PicksMode = 'products' | 'collections' | 'custom';

// ── Shared ──────────────────────────────────────────────────────────────────

export interface CustomPickItem {
  image: string;       // path relative to /public, e.g. '/images/hero.jpg'
  imageAlt: string;    // alt text for accessibility
  kicker: string;      // small ALL-CAPS label rendered above the card title
  title: string;       // main card heading
  body: string;        // supporting copy below the title
  href: string;        // card CTA link destination (product page, collection, etc.)
  linkLabel: string;   // CTA link text, e.g. 'Shop' or 'Explore'
  price?: string;      // optional — omit entirely to hide the price line
  currency?: string;   // optional — shown as small text beside the price
}

// ── Products mode ────────────────────────────────────────────────────────────

export interface ProductsPicksConfig {
  // ─── Collection source ────────────────────────────────────────────────────
  // Shopify collection handle to pull products from.
  // Find it in Shopify Admin → Products → Collections → <collection> → handle field.
  // Example: /collections/wireless-headphones → handle is 'wireless-headphones'.
  collectionHandle: string;

  // ─── Product count ────────────────────────────────────────────────────────
  // How many products to fetch and display from the collection.
  productLimit: number;

  // ─── Grid column count ────────────────────────────────────────────────────
  // Desktop only — responsive breakpoints handle narrower screens automatically.
  // '2-col' | '3-col' (default) | '4-col'
  layout: PicksLayout;

  // ─── Description truncation ───────────────────────────────────────────────
  // Controls how much of the product description is shown on each card.
  // descriptionLength: the cutoff number (characters or words).
  // descriptionUnit:   'chars' truncates by character count (good for tight layouts).
  //                    'words' truncates by word count (good for varied descriptions).
  // Set descriptionLength to 0 to hide descriptions entirely.
  descriptionLength: number;
  descriptionUnit: 'chars' | 'words';

  // ─── Kicker labels ────────────────────────────────────────────────────────
  // Small ALL-CAPS label shown above each card title.
  // Map product handle → label text for specific overrides.
  // Example: { 'audicraft-pro-x': 'The Sound', 'chronox-elite': 'The Wrist' }
  kickers: Record<string, string>;

  // ─── Kicker fallback ──────────────────────────────────────────────────────
  // Used when a product has no entry in `kickers` above.
  // 'collection'   → always use the collection name (e.g. "Headphones").
  //                  Recommended — guarantees every card has a kicker label.
  // 'product-type' → use the product's Type field (Shopify Admin → Products → Type).
  //                  Cascades to collection name when the product's Type is empty,
  //                  ensuring every card still shows a label even if Type is not set.
  // 'none'         → intentionally blank; no kicker shown on any card.
  kickerFallback: 'collection' | 'product-type' | 'none';
}

// ── Full instance config ─────────────────────────────────────────────────────

export interface PicksConfig {
  // ─── Mode selector ──────────────────────────────────────────────────────
  // 'products'    → uses productsConfig + live Shopify products
  // 'collections' → uses collectionsConfig + live Shopify collection cards
  // 'custom'      → uses customItems + no API call
  mode: PicksMode;

  // ─── Section header ─────────────────────────────────────────────────────
  // Wrap words in *asterisks* for italic accent rendering.
  label: string;       // eyebrow chip above the title (e.g. "Editor's Picks")
  title: string;       // main section heading; *word* → <em>word</em>

  // ─── "View all" CTA link ────────────────────────────────────────────────
  viewAllHref: string;   // destination URL
  viewAllLabel: string;  // button/link text

  // ─── Mode-specific config (only the matching one is used) ───────────────
  productsConfig?: ProductsPicksConfig;

  collectionsConfig: {
    handles: string[];        // Shopify collection handles, in display order
    layout: PicksLayout;      // '2-col' | '3-col' | '4-col'
    kickers: Record<string, string>; // handle → kicker label
  };

  customItems: CustomPickItem[];
}

// ============================================================
//  Home page Picks instances
//  Each { ... } object is one independent section.
//  Add more objects to render additional sections.
// ============================================================
export const PICKS: PicksConfig[] = [
  // ── Instance 1 — products from a Shopify collection ───────────────────────
  {
    mode: 'custom',  // ← 'products' | 'collections' | 'custom'

    label: "Editor's Picks",
    title: "Three products our editors *keep coming back to*.",
    viewAllHref: '/collections',    // link next to the section title
    viewAllLabel: 'See full edit',

    // ── Products mode config (used when mode === 'products') ──────────────
    productsConfig: {
      // Shopify collection handle — replace with your actual handle.
      collectionHandle: 'sale',

      // How many products to show (fetched in order from the collection).
      productLimit: 3,

      // Grid column count on desktop.
      layout: '3-col',

      // Description truncation — 120 characters, append "..." if exceeded.
      // Set descriptionLength to 0 to hide descriptions entirely.
      descriptionLength: 120,
      descriptionUnit: 'chars',  // 'chars' | 'words'

      // Optional kicker label per product handle.
      // Add entries here to override the kicker for specific products.
      // Example: { 'wireless-pro-headphones': 'The Sound' }
      kickers: {},

      // Kicker shown when a product has no entry in `kickers` above.
      // 'collection' → collection name (recommended — always shows a label)
      // 'product-type' → product Type field, cascades to collection name if empty
      // 'none' → no kicker
      kickerFallback: 'collection',
    },

    // ── Collections mode config (used when mode === 'collections') ────────
    collectionsConfig: {
      handles: ['sale', 'phone-tablet', 'pc-laptop'],
      layout: '3-col',
      kickers: {
        'phone-tablet': 'The Wrist',
        'pc-laptop': 'The Workhorse',
      },
    },

    // ── Custom mode items (used when mode === 'custom') ───────────────────
    customItems: [
      {
        // Card 1 ─────────────────────────────────────────────────────────────
        image: imgUrl('/images/mp3wg2xy-01.jpg'),
        imageAlt: 'AudioCraft Pro X Wireless',
        kicker: 'The Sound',
        title: 'A new benchmark for noise cancellation.',
        body: 'After six weeks of daily testing, the AudioCraft Pro X has quietly become the pair we reach for first. It\'s not the loudest. It\'s the most considered.',
        href: '/products/kb-phone-15-pro',
        linkLabel: 'Shop',
        price: '$399',
        currency: 'USD',
      },
      {
        // Card 2 ─────────────────────────────────────────────────────────────
        image: imgUrl('/images/mp3wg2y0-02.jpg'),
        imageAlt: 'ChronoX Elite Watch',
        kicker: 'The Wrist',
        title: 'Swiss craft, meet five-day battery.',
        body: 'The ChronoX Elite proves that a thoughtful smartwatch can wear like an heirloom. Brushed titanium, sapphire crystal, and an interface that respects your time.',
        href: '/products/network-bridges-x1',
        linkLabel: 'Shop',
        price: '$499',
        currency: 'USD',
      },
      {
        // Card 3 ─────────────────────────────────────────────────────────────
        image: imgUrl('/images/mp3wg2y5-03.jpg'),
        imageAlt: 'ProBook Ultra X1 Laptop',
        kicker: 'The Workhorse',
        title: 'The laptop that finally got out of the way.',
        body: 'The ProBook Ultra X1 doesn\'t ask to be admired. It asks to be used. After 30 days of writing, editing and shipping from it, we\'re not switching back.',
        href: '/products/packbook-pro-15inch',
        linkLabel: 'Shop',
        price: '$1,899',
        currency: 'USD',
      },
    ],
  },

  // ── Instance 2 (example — remove or edit to suit) ─────────────────────────
  // {
  //   mode: 'products',
  //   label: 'New Arrivals',
  //   title: 'Fresh from the *edit*.',
  //   viewAllHref: '/collections/new-arrivals',
  //   viewAllLabel: 'View all',
  //   productsConfig: {
  //     collectionHandle: 'new-arrivals',
  //     productLimit: 4,
  //     layout: '4-col',
  //     descriptionLength: 80,
  //     descriptionUnit: 'chars',
  //     kickers: {},
  //     kickerFallback: 'collection',
  //   },
  //   collectionsConfig: { handles: [], layout: '3-col', kickers: {} },
  //   customItems: [],
  // },
];
