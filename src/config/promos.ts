// ============================================================
//  Promo Section Configuration
//
//  mode: 'collection' | 'custom'
//
//  ── 'collection' ────────────────────────────────────────────
//  Add collection handles to  collectionConfig.handles.
//  For each handle the section automatically fetches from Shopify:
//    image       → collection image
//    title       → collection title       (used as card heading)
//    description → collection description (used as eyebrow label)
//    URL         → /collections/<handle>
//
//  ── 'custom' ────────────────────────────────────────────────
//  Fill in  customItems  manually — no Shopify call is made.
//  Each item has: image, link, title, description, badge, ctaText.
//
//  count — how many cards to display (taken from the list in order).
// ============================================================

export type PromoMode = 'collection' | 'custom';

// ── Custom mode — one entry per card ─────────────────────────
export interface PromoCustomItem {
  // ── Required ────────────────────────────────────────────────
  image: string;        // filename from /public/images/  e.g. 'gaming-room.jpg'
  link: string;         // destination URL  e.g. '/collections/audio'
  title: string;        // main card heading  (promo-title)
  description: string;  // eyebrow label above the title  (promo-cat)

  // ── Optional ────────────────────────────────────────────────
  badge?: string;       // small top-left label  e.g. 'New Arrivals'
  ctaText?: string;     // Shop button text  — defaults to 'Shop <description>'
}

export interface PromoConfig {
  mode: PromoMode;      // ← 'collection' | 'custom'
  count: number;        // how many cards to display

  // ── Collection mode (used when mode === 'collection') ─────────────────────
  collectionConfig: {
    // Add one Shopify collection handle per card.
    // image, title, description, and URL are pulled automatically.
    handles: string[];
  };

  // ── Custom mode (used when mode === 'custom') ──────────────────────────────
  customItems: PromoCustomItem[];
}

// ============================================================
//  Config
// ============================================================
export const PROMO: PromoConfig = {
  mode: 'custom',  // ← 'collection' | 'custom'

  count: 3,  // number of promo cards to show

  // ── Collection mode config ────────────────────────────────────────────────
  // Used when mode === 'collection'.
  // Add one handle per card — image, title, description, and URL come from Shopify.
  collectionConfig: {
    handles: [
      'cameras',     // ← replace with your real Shopify collection handle
      'wearables',   // ← replace with your real Shopify collection handle
      'audio',       // ← replace with your real Shopify collection handle
    ],
  },

  // ── Custom mode items ─────────────────────────────────────────────────────
  // Used when mode === 'custom'.
  // All content is set manually below — no Shopify data is fetched.
  customItems: [
    {
      // Card 1 ──────────────────────────────────────────────────────────────
      image: 'close-up-camera-tripod-sandy-beach-camera-with-lens.jpg',
      link: '/collections/for-creators',
      badge: 'New Arrivals',
      description: 'Photography',
      title: 'Capture the moment — mirrorless & beyond',
      ctaText: 'Shop cameras',
    },
    {
      // Card 2 ──────────────────────────────────────────────────────────────
      image: 'person-wearing-health-technology-like-smartwatch-monitoring-vital-signs-exercise.jpg',
      link: '/collections/accessories',
      badge: 'Best Seller',
      description: 'Wearables',
      title: 'Health meets style — smartwatches built for life',
      ctaText: 'Shop wearables',
    },
    {
      // Card 3 ──────────────────────────────────────────────────────────────
      image: 'wireless-earbuds-charging-case-dark-surface.jpg',
      link: '/collections/phone-tablet',
      badge: 'Staff Pick',
      description: 'Audio',
      title: 'Wireless freedom — earbuds & headphones curated',
      ctaText: 'Shop audio',
    },
  ],
};
