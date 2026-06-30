// ============================================================
//  Hero — editorial cover configuration
//  All text, links, and image for the homepage Hero section.
//
//  heading / intro support *word* → <em>word</em> italic accents.
// ============================================================

export const HERO = {
  /** Small rotated sidebar label (desktop only). */
  sidebarText: 'SPRING · VOL III · MMXXVI',

  /** Cover image filename (resolved via ~/lib/assets img()). */
  coverImage: '00.jpg',

  /** Alt text for the cover image (overridden by featured product title when set). */
  coverAlt: 'The Sound Edit — Issue 03 cover',

  /** Small caption overlaid on the cover photo. */
  photoCredit: 'Photographed by A. Vasquez · Issue 03',

  /** Editorial eyebrow label above the heading. */
  issueLabel: 'Issue 03 · The Sound Edit',

  /** Main heading. Wrap a word in *asterisks* for the italic accent → *revolution*. */
  heading: 'The quiet *revolution* in personal audio.',

  /** Intro paragraph beneath the heading. */
  intro:
    "Five wireless headphones our editors keep returning to — and why “premium” has quietly come to mean something new in 2026.",

  /** Primary CTA button. */
  primaryCta: {
    label: 'Read the edit',
    href: '#editors-picks',
  },

  /** Secondary link CTA. */
  secondaryCta: {
    label: 'Shop the issue',
    href: '/products',
  },

  /** Byline row beneath the CTAs. */
  byline: {
    publishedDate: '12 May 2026',
    readTime: '9 min read',
    author: 'Anna Vasquez',
  },
} as const;
