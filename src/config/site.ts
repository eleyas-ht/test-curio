// ============================================================
//  Site Configuration — global brand identity
//  Single source of truth for brand name, announcements,
//  social links, value props, footer text/legal, and more.
//
//  Section-specific configuration lives in dedicated files:
//    src/config/hero.ts    → Hero cover section (home page)
//    src/config/picks.ts   → Editor's Picks section
//    src/config/journal.ts → Journal section
//    src/config/promos.ts  → Promo banner section
//    src/config/faqs.ts    → FAQ accordion section
//    src/config/nav.ts     → Header navigation (Shopify or custom)
//    src/config/footer.ts  → Footer menu columns (Shopify or custom)
// ============================================================

export const SITE = {
  name: 'Curio',
  /** Small superscript on the wordmark. */
  brandSuffix: 'The Edit',
  tagline: 'Tech, curated.',
  issue: 'Issue 03 · Spring 2026',
  /** Free-shipping threshold (matches the value in `announcements`). */
  freeShippingThreshold: 75,
  /**
   * Standard shipping cost added to the cart total when the order is below
   * `freeShippingThreshold`. Set to 0 to always show free shipping.
   * This is a display-only estimate — Shopify calculates the real rate at checkout.
   */
  shippingCost: 9.99,
  description:
    "An editorial electronics store. Editor's picks, buying guides, and the products our editors actually recommend — curated by humans, shipped fast, returned without hassle.",
  // Rotating announcement bar (top ticker). `*words*` become italic accents.
  announcements: [
    "Complimentary shipping on orders over $75 — read this week's *Editor's Letter*",
    '*Spring Issue 03* — 48 products our editors actually recommend',
    'New: The *Best Headphones of 2026* — our definitive guide',
    'Join the Edit — exclusive access, buying guides & early drops',
  ],
  social: [
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' as const },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' as const },
    { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' as const },
    { label: 'Spotify', href: 'https://spotify.com', icon: 'spotify' as const },
  ],
  /** Trust strip on home + PDP. */
  valueProps: [
    { icon: 'truck' as const, title: 'Free Shipping', body: 'On orders over $75' },
    { icon: 'rotate' as const, title: '30-Day Returns', body: 'No questions asked' },
    { icon: 'shield' as const, title: '2-Year Warranty', body: 'Repaired or replaced' },
    { icon: 'clock' as const, title: '24/7 Concierge', body: 'Real humans, anytime' },
  ],
  /** Footer statement headline (serif). `*words*` = italic accent, `\n` = line break. */
  footerStatement: 'Tech, *curated*.\nStories, sold separately.',
  footerTagline:
    'An editorial electronics store. Curated by humans, shipped fast, returned without hassle.',
  /** Footer legal row. Footer menu columns live in src/config/footer.ts. */
  legal: [
    { label: 'Privacy', href: '/pages/privacy' },
    { label: 'Terms', href: '/pages/terms' },
    { label: 'Cookies', href: '/pages/cookies' },
    { label: 'Accessibility', href: '/pages/accessibility' },
  ],
  copyright: '© 2026 Curio · The Edit · All rights reserved',
  /**
   * Cart drawer "You May Also Like" recommendations.
   *
   * mode: 'shopify' → pull from the Shopify collection with handle
   *   "cart-recommendations" (curate in Shopify Admin → Collections).
   *   Falls back to best-selling products if the collection doesn't exist.
   *
   * mode: 'custom' → show exactly the products listed in `handles`.
   *   Products are shown in the order given; unavailable products are skipped.
   *   Add Shopify product handles here (the slug after /products/ in the URL).
   */
  /**
   * Cart page Gift Wrap add-on.
   * Set `handle` to the Shopify product handle of your gift wrap product.
   * The variant ID and price are fetched automatically at request time.
   * Set `handle` to '' to hide the Gift Wrap option entirely.
   */
  giftWrap: {
    handle: 'gift-wrap',
  },
  cartRecommendations: {
    mode: 'custom' as 'shopify' | 'custom',
    /**
     * How many rec cards to show at once.
     * If more products are available than this number, the remaining
     * cards are accessible via a prev/next slider in the cart drawer.
     */
    count: 3,
    handles: [
      'kb-phone-15-pro',
      'packbook-pro-15inch',
      'smart-phone-12',
      'lf-7-pro',
    ] as string[],
  },
} as const;
