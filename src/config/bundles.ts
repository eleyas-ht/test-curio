// ============================================================
//  Bundle Section Configuration — "CURATED BUNDLE · The Setup"
//
//  The Bundle section is a rotating carousel of curated product
//  bundles. Each bundle (slide) pairs 2–5 products as a cohesive
//  setup, applies a discount when all items are selected, and
//  lets shoppers deselect individual items before adding to cart.
//
//  ── Mode ────────────────────────────────────────────────────
//  'shopify'  → fetches live Shopify products by handle.
//               Prices, images, variants, and availability all
//               come from the Storefront API. Cart integration
//               is fully functional (real variant IDs).
//
//  'custom'   → static data defined in `customProducts` below.
//               No Shopify API call. Use for mockups, demos, or
//               when products haven't been created in Shopify yet.
//               The Add-to-cart button is disabled in this mode.
//
//  ── Adding / reordering bundles ─────────────────────────────
//  Each object in the `bundles` array is one slide. Add, remove,
//  or reorder objects freely — the navigation arrow cycles through
//  them in array order. There is no hard limit on slide count.
//
//  ── Finding product handles ──────────────────────────────────
//  Shopify Admin → Products → [product] → the URL slug after
//  /products/ is the handle.
//  Example: /products/audiocraft-pro-x → 'audiocraft-pro-x'
//
// ============================================================

export type BundleMode = 'shopify' | 'custom';

// ── Custom-mode product item ─────────────────────────────────

export interface CustomBundleProduct {
  // Product thumbnail (URL or /public path, e.g. '/images/product.jpg')
  image: string;
  // Product display name
  name: string;
  // Short one-liner shown below the name (editorial caption, not description)
  description: string;
  // Numeric price used for bundle calculations (in store currency)
  price: number;
  // Optional compare-at price; shows as strikethrough when set and above `price`
  compareAtPrice?: number;
}

// ── Per-bundle (per-slide) config ────────────────────────────

export interface BundleSlideConfig {
  // ─── Slide header ─────────────────────────────────────────────────────────
  // Small eyebrow label shown above the title (e.g. "Curated Setup · No. 01")
  label: string;

  // Main slide title. Wrap one word in <em>…</em> for the italic clay accent.
  // Example: 'The <em>Sound</em> Setup.'
  title: string;

  // Short editorial paragraph shown below the title.
  intro: string;

  // ─── Hero image ───────────────────────────────────────────────────────────
  // Lifestyle / editorial image shown on the left panel of the bundle slide.
  // Use a full URL (Unsplash, CDN) or a /public path (e.g. '/images/setup-01.jpg').
  heroImage: string;

  // ─── Discount ─────────────────────────────────────────────────────────────
  // Percentage off applied when ALL items in this bundle are selected.
  // Example: 18 → "Save 18%" and the total is reduced by 18%.
  // Set to 0 to disable bundle discount.
  discount: number;

  // ─── CTA button ───────────────────────────────────────────────────────────
  // Text shown on the "Add to cart" button when all items are selected.
  // Defaults to 'Add Setup to cart' when omitted.
  ctaText?: string;

  // ─── Bundle discount code ─────────────────────────────────────────────────
  // Shopify discount code to apply automatically when the full bundle is added
  // to cart. The code is merged with any code the shopper has already entered,
  // so existing discounts are preserved.
  //
  // HOW TO SET UP:
  //   Shopify Admin → Discounts → Create discount → Discount code
  //   • Type: Percentage
  //   • Value: same as the `discount` percentage above
  //   • Applies to: the specific products in this bundle (or "All products")
  //   • Usage limit: set as needed
  //   Then paste the code string here, e.g. 'BUNDLE-WORK-10'
  //
  // Leave undefined (or omit) to skip automatic discount application.
  discountCode?: string;

  // ─── Shopify mode — product handles ───────────────────────────────────────
  // Shopify product handles for this bundle, in display order.
  // Only used when the top-level `mode` is 'shopify'.
  // Products that return null (draft, wrong handle, deleted) are silently skipped.
  productHandles: string[];

  // ─── Custom mode — static products ────────────────────────────────────────
  // Static product data used when the top-level `mode` is 'custom'.
  // Not fetched from Shopify — prices and images are exactly as typed here.
  customProducts: CustomBundleProduct[];
}

// ── Top-level config ─────────────────────────────────────────

export interface BundleConfig {
  // 'shopify' | 'custom' — applies globally to all bundles.
  mode: BundleMode;

  // ─── Description word limit ────────────────────────────────────────────────
  // How many words of each product's Shopify description to show per bundle
  // item row. Long descriptions are truncated at the nearest word boundary and
  // an ellipsis is added.
  //
  // Examples:
  //   10  → "The KB Phone 15 Pro is a cutting-edge device with fast…"
  //   6   → "The KB Phone 15 Pro is…"
  //   0   → hide descriptions entirely
  descriptionWordLimit: number;

  // All bundle slides, in carousel order.
  bundles: BundleSlideConfig[];
}

// ============================================================
//  Bundle configuration — edit this to customise the section
// ============================================================

export const BUNDLE: BundleConfig = {
  // ── Mode ───────────────────────────────────────────────────────────────────
  // Switch to 'shopify' and fill in `productHandles` for live Shopify products.
  // Use 'custom' for demos or while populating your Shopify store.
  mode: 'shopify',

  // ── Description word limit ─────────────────────────────────────────────────
  // How many words of each product's Shopify description to show per item row.
  // Set to 0 to hide descriptions entirely.
  descriptionWordLimit: 10,

  // ── Bundle slides ──────────────────────────────────────────────────────────
  bundles: [
    {
      // ── Bundle 1: The Work Setup ─────────────────────────────────────────
      label: 'Curated Setup · No. 01',
      title: 'The <em>Work</em> Setup.',
      intro:
        'Engineered for deep focus — three tools that eliminate friction and raise the standard of every session. Save 18% when you take all three.',
      heroImage: '/images/curated-setup-04.jpg',
      discount: 18,
      ctaText: 'Add Setup to cart',
      // Create this code in Shopify Admin → Discounts → Create discount → Discount code
      // Type: Percentage, Value: 10%, Applies to: the products in this bundle
      discountCode: 'BUNDLE-WORK-10',

      // Replace these with your real Shopify product handles (mode: 'shopify')
      productHandles: [
        'zackpot-speaker-1', // example — replace with your handle
        'mango-router',       // example — replace with your handle
        'lf-7-pro',   // example — replace with your handle
      ],

      customProducts: [
        {
          image:
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=160&q=80&fit=crop',
          name: 'ErgoDesk Pro Stand',
          description: 'Precision aluminium laptop riser',
          price: 89,
        },
        {
          image:
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=160&q=80&fit=crop',
          name: 'KeyFlow MX100',
          description: 'Tactile mechanical keyboard',
          price: 229,
        },
        {
          image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&q=80&fit=crop',
          name: 'SilentArc Studio',
          description: 'Active noise-cancellation headphones',
          price: 349,
        },
      ],
    },

    {
      // ── Bundle 2: The Vision Setup ───────────────────────────────────────
      label: 'Curated Setup · No. 02',
      title: 'The <em>Vision</em> Setup.',
      intro:
        'For those who capture the world before it moves on — paired for cohesion, carried as a system. Save 20% when you take all three.',
      heroImage: '/images/curated-setup-02.jpg',
      discount: 20,
      ctaText: 'Add Setup to cart',
      discountCode: 'BUNDLE-VISION-20',

      productHandles: [
        'decorex-d25-camera',
        'smart-phone-12',
        'xonic-cc-camera',
      ],

      customProducts: [
        {
          image:
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&q=80&fit=crop',
          name: 'FrameOne X Pro',
          description: 'Full-frame mirrorless body',
          price: 899,
        },
        {
          image:
            'https://images.unsplash.com/photo-1606986628253-e2d6b45b5e3e?w=160&q=80&fit=crop',
          name: 'OpticCore 35mm',
          description: 'f/1.8 prime portrait lens',
          price: 299,
        },
        {
          image:
            'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=160&q=80&fit=crop',
          name: 'CaseWorks Field Bag',
          description: 'Padded all-weather carry',
          price: 149,
        },
      ],
    },

    {
      // ── Bundle 3: The Home Setup ─────────────────────────────────────────
      label: 'Curated Setup · No. 03',
      title: 'The <em>Home</em> Setup.',
      intro:
        'A smarter home starts with three decisions made well — not a dozen gadgets made poorly. Save 20% when you take all three.',
      heroImage: '/images/curated-setup-03.jpg',
      discount: 20,
      ctaText: 'Add Setup to cart',
      discountCode: 'BUNDLE-HOME-20',

      productHandles: [
        'packbook-pro-15inch',
        'zpad-pro-m-2',
        'zackpot-speaker',
      ],

      customProducts: [
        {
          image:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=160&q=80&fit=crop',
          name: 'EchoNode Speaker',
          description: 'Room-filling smart audio',
          price: 199,
        },
        {
          image:
            'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=160&q=80&fit=crop',
          name: 'GlowFrame Display',
          description: '10″ ambient smart display',
          price: 249,
        },
        {
          image:
            'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=160&q=80&fit=crop',
          name: 'LumiKit 4-Pack',
          description: 'Matter-compatible smart bulbs',
          price: 89,
        },
      ],
    },

    {
      // ── Bundle 4: The Sound Setup ────────────────────────────────────────
      label: 'Curated Setup · No. 04',
      title: 'The <em>Sound</em> Setup.',
      intro:
        'Three pieces our editors actually use together — chosen as a system, not a list. Save 18% when you take all three.',
      heroImage: '/images/curated-setup-01.jpg',
      discount: 18,
      ctaText: 'Add Setup to cart',
      discountCode: 'BUNDLE-SOUND-18',

      productHandles: [
        'mango-router',
        'lf-7-pro',
        'network-bridges-x1',
      ],

      customProducts: [
        {
          image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&q=80&fit=crop',
          name: 'AudioCraft Pro X',
          description: 'Reference wireless headphones',
          price: 399,
        },
        {
          image:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=160&q=80&fit=crop',
          name: 'BeatCore Mini Speaker',
          description: 'Pocket-sized hi-fi for any room',
          price: 199,
        },
        {
          image:
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=160&q=80&fit=crop',
          name: 'CoreBuds Pro',
          description: 'For the walk between the two',
          price: 149,
        },
      ],
    },
  ],
};
