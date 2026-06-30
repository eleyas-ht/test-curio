// ============================================================
//  Journal Section Configuration
// ============================================================

// ── Shopify Blog Settings ────────────────────────────────────
//
// blogHandle
//   The handle of the Shopify blog to pull articles from.
//   Find it in Shopify admin → Online Store → Blog Posts →
//   select the blog → the handle appears in the URL, e.g.
//   /admin/blogs/12345/articles → handle is "news".
//   Set to '' (empty string) to disable live fetching and
//   display the JOURNAL_FALLBACK articles below instead.
//
// articleCount
//   Number of articles to display (default: 3 to match the
//   3-column grid). Increase for a wider grid variant.
//
// showExcerpt
//   Set to false to hide the excerpt paragraph beneath each
//   article title.
//
// excerptMaxLength
//   Truncate excerpts to this many characters and append "…".
//   Set to 0 for no truncation.
//
// allArticlesHref
//   URL for the "All journal" link in the section header.
//   Typically "/blogs/{blogHandle}" for a Shopify-hosted blog.

export const JOURNAL_CONFIG = {
  blogHandle: 'news',          // ← set to your blog handle, or '' for static fallback
  articleCount: 3,             // ← how many articles to show
  showExcerpt: true,           // ← show/hide the article excerpt
  excerptMaxLength: 160,       // ← 0 = no limit
  allArticlesHref: '/blogs/news', // ← "All journal" link destination
} as const;

// ── Static Fallback Articles ─────────────────────────────────
//
// These articles are shown when:
//   - blogHandle is '' (disabled), or
//   - the Shopify fetch fails (network error, missing blog, etc.)
//
// Each entry maps 1-to-1 with the journal card layout.
// image filenames resolve from /public/images/.

export const JOURNAL_FALLBACK = [
  {
    category: 'Essay',
    title: 'Five things we got wrong about wireless audio.',
    excerpt:
      "We've spent a decade telling ourselves wired sounds \"warmer.\" The truth, after a year of blind tests, is a little more interesting.",
    author: 'James Park',
    date: '',           // leave blank for static cards (no date shown)
    image: '/images/blog-1.jpg',
    href: '#',
  },
  {
    category: 'Review',
    title: 'The case for buying one good laptop.',
    excerpt:
      'Specs treadmills are exhausting. What if you bought one laptop, kept it five years, and let everyone else burn out chasing the chart?',
    author: 'Maya Lin',
    date: '',
    image: '/images/blog-2.jpg',
    href: '#',
  },
  {
    category: 'Photography',
    title: 'Why your phone camera replaced your camera.',
    excerpt:
      "It's not just the sensor. It's the software, the friction, and a single design decision that everyone copied — for good reason.",
    author: 'Ren Okafor',
    date: '',
    image: '/images/blog-3.jpg',
    href: '#',
  },
] as const;
