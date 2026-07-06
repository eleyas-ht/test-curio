// ============================================================
//  Testimonials Section Configuration
//
//  This section displays customer testimonials in an editorial
//  filmstrip carousel. The large quote cross-fades as visitors
//  click the avatar thumbnails below, or auto-advances on a timer.
//
//  ─── Adding / removing testimonials ────────────────────────────
//  Add, remove, or reorder objects in the `testimonials` array.
//  Each entry is one review. Changes appear on the next build or
//  hot-reload. There is no minimum or maximum count.
//
//  ─── Product chip (optional) ────────────────────────────────────
//  Each testimonial can optionally show a small product chip below
//  the author byline. Two ways to supply product data:
//
//  Option A — productHandle (Shopify, recommended)
//    Set a Shopify product handle and the page fetches the live
//    title, price, and featured image from the Storefront API at
//    build time.
//    Find the handle: Shopify Admin → Products → <product> → URL handle.
//    e.g. /products/auraphones-pro → handle is 'auraphones-pro'
//
//  Option B — product (inline, no Shopify call)
//    Manually supply { name, price, image } for the chip.
//    Useful when you have no Shopify catalogue or want to reference
//    an external product.
//
//  Priority: productHandle (if it resolves) → product (inline) → no chip.
//  Leave both blank to hide the chip entirely.
//
//  ─── Filmstrip avatar ───────────────────────────────────────────
//  The `avatar` field drives the circular thumbnail in the navigation
//  strip below the quote. Tip: use the associated product image or a
//  customer headshot. Path is relative to /public.
// ============================================================

import { imgUrl } from '~/lib/assets';

export interface TestimonialInlineProduct {
  name: string;   // Product title shown in the chip
  price: string;  // Pre-formatted price string, e.g. '$249'
  image: string;  // Path relative to /public, e.g. '/images/product.jpg'
}

export interface Testimonial {
  // ─── Quote ────────────────────────────────────────────────────────────────
  // The review text. Wrap a phrase in <strong>…</strong> to emphasise it in
  // the clay accent color (warm terracotta).
  // Example: 'Amazing product. <strong>Best purchase I\'ve made this year.</strong>'
  text: string;

  // ─── Rating ───────────────────────────────────────────────────────────────
  // Star rating from 1 to 5. Stars beyond this number appear dimmed.
  stars: 1 | 2 | 3 | 4 | 5;

  // ─── Author ───────────────────────────────────────────────────────────────
  name: string;    // Customer's display name shown below the quote
  role?: string;   // Optional: job title or context (e.g. 'Designer at Studio X')
  date?: string;   // Optional: review date string (e.g. 'June 2025')

  // ─── Filmstrip avatar ─────────────────────────────────────────────────────
  // Circular thumbnail in the navigation strip below the quote.
  avatar: string;      // Path relative to /public, e.g. '/images/earbuds.jpg'
  avatarAlt?: string;  // Alt text for the avatar image

  // ─── Product chip (optional) ──────────────────────────────────────────────
  // Choose ONE of the two options below. Both can coexist — productHandle takes
  // priority when it resolves to a valid Shopify product.

  // Option A — Shopify handle (live data fetched at build time):
  productHandle?: string; // e.g. 'auraphones-pro'  |  leave blank to skip

  // Option B — Inline product chip (manual, no API call):
  product?: TestimonialInlineProduct;
}

export interface TestimonialsSettings {
  // ─── Section label ────────────────────────────────────────────────────────
  // Small uppercase label above the section. Set to '' to hide it.
  label: string;

  // ─── Auto-play ────────────────────────────────────────────────────────────
  autoPlay: boolean;
  // Milliseconds between auto-advances. Default: 5000 (5 s).
  autoPlayInterval: number;
}

export interface TestimonialsConfig {
  settings: TestimonialsSettings;
  testimonials: Testimonial[];
}

// ============================================================
//  Home page Testimonials instance — edit entries below
// ============================================================
export const TESTIMONIALS: TestimonialsConfig = {
  settings: {
    label: 'The Verdict',
    autoPlay: true,
    autoPlayInterval: 5000,
  },

  testimonials: [
    {
      // ── Testimonial 1 ─────────────────────────────────────────────────────
      text: "The AuraPhones have genuinely changed how I work. I put them on at 8am and forget they're there — the comfort is unreal. <strong>Best purchase I've made this year.</strong>",
      stars: 5,
      name: 'Sarah Chen',
      role: 'Product Designer at Muybridge',
      avatar: imgUrl('/images/mp51zozi-earbuds.jpg'),
      avatarAlt: 'AuraPhones Pro earbuds',
      // ─ Set a Shopify handle to load live product data:
      productHandle: '', // e.g. 'auraphones-pro'
      // ─ Inline fallback (used when productHandle is blank or fails):
      product: {
        name: 'AuraPhones Pro',
        price: '$249',
        image: imgUrl('/images/mp51zozi-earbuds.jpg'),
      },
    },
    {
      // ── Testimonial 2 ─────────────────────────────────────────────────────
      text: "I've tested six camera systems this quarter. Nothing comes close to the AuraPhone 15 Pro for low-light shots. <strong>It's my daily carry now.</strong>",
      stars: 5,
      name: 'James Okonkwo',
      role: 'Photographer at Studio North',
      avatar: imgUrl('/images/mp51zozf-camera.jpg'),
      avatarAlt: 'AuraPhone 15 Pro camera',
      productHandle: '', // e.g. 'auraphone-15-pro'
      product: {
        name: 'AuraPhone 15 Pro',
        price: '$1,149',
        image: imgUrl('/images/mp51zozf-camera.jpg'),
      },
    },
    {
      // ── Testimonial 3 ─────────────────────────────────────────────────────
      text: "Set up the BeatCore Mini in my kitchen three months ago. It hasn't stopped playing since. <strong>The battery life is absurdly good.</strong>",
      stars: 4,
      name: 'Elena Rossi',
      role: 'Chef at Trattoria Moderna',
      avatar: imgUrl('/images/mp51zp5u-speaker.jpg'),
      avatarAlt: 'BeatCore Mini speaker',
      productHandle: '', // e.g. 'beatcore-mini'
      product: {
        name: 'BeatCore Mini',
        price: '$199',
        image: imgUrl('/images/mp51zp5u-speaker.jpg'),
      },
    },
    {
      // ── Testimonial 4 ─────────────────────────────────────────────────────
      text: "Ordered the CoreBook Air on a Tuesday, arrived Wednesday. Two weeks in and I've already convinced three colleagues to switch. <strong>Flawless machine.</strong>",
      stars: 5,
      name: 'David Kim',
      role: 'Software Engineer at Relay',
      avatar: imgUrl('/images/mp51zozm-smartphone.jpg'),
      avatarAlt: 'CoreBook Air laptop',
      productHandle: '', // e.g. 'corebook-air'
      product: {
        name: 'CoreBook Air',
        price: '$1,499',
        image: imgUrl('/images/mp51zozm-smartphone.jpg'),
      },
    },
    {
      // ── Testimonial 5 ─────────────────────────────────────────────────────
      text: "The ChronoX Elite tracks my sleep better than any dedicated device I've owned. The titanium case is beautiful. <strong>Worth every premium penny.</strong>",
      stars: 5,
      name: 'Maya Torres',
      role: "Cardiologist at St. Luke's",
      avatar: imgUrl('/images/mp51zozp-smartwatch.jpg'),
      avatarAlt: 'ChronoX Elite smartwatch',
      productHandle: '', // e.g. 'chronox-elite'
      product: {
        name: 'ChronoX Elite',
        price: '$649',
        image: imgUrl('/images/mp51zozp-smartwatch.jpg'),
      },
    },
    {
      // ── Testimonial 6 ─────────────────────────────────────────────────────
      text: 'Bought the TabView Pro for my design workflow. The screen is the best I\'ve seen on a tablet — color-accurate, bright, and responsive to the stylus.',
      stars: 4,
      name: 'Anika Sharma',
      role: 'UI Designer at Freelance',
      avatar: imgUrl('/images/mp51zp5y-tab.jpg'),
      avatarAlt: 'TabView Pro tablet',
      productHandle: '', // e.g. 'tabview-pro'
      product: {
        name: 'TabView Pro',
        price: '$899',
        image: imgUrl('/images/mp51zp5y-tab.jpg'),
      },
    },
  ],
};
