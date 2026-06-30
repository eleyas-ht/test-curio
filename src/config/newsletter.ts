// ============================================================
//  Newsletter Configuration
//
//  Four providers are supported. Set `provider` below, then add
//  the matching env vars to your .env file.
//
//  ── 'shopify' (default) ────────────────────────────────────
//  Uses the Shopify Admin API `customerCreate` mutation.
//  Subscribers appear as Customers in Shopify admin (Customers →
//  Email marketing consent: Subscribed). Existing customers have
//  their marketing consent updated instead of creating a duplicate.
//  Required env var:
//    SHOPIFY_ADMIN_API_TOKEN — Admin API access token with
//                              write_customers + read_customers scopes.
//  How to create:
//    Shopify Admin → Settings → Apps → Develop apps → Create app
//    → Configure Admin API scopes: write_customers, read_customers
//    → Install app → copy the Admin API access token (shown once).
//
//  ── 'klaviyo' ──────────────────────────────────────────────
//  Adds the subscriber to a Klaviyo list via the v3 Profiles API.
//  Required env vars:
//    KLAVIYO_API_KEY   — private API key from Klaviyo → Account → API Keys
//    KLAVIYO_LIST_ID   — List ID from Klaviyo → Lists & Segments → (list) → Settings
//
//  ── 'mailchimp' ────────────────────────────────────────────
//  Adds the subscriber to a Mailchimp audience via the Marketing API.
//  Required env vars:
//    MAILCHIMP_API_KEY     — API key from Mailchimp → Account → Extras → API Keys
//    MAILCHIMP_AUDIENCE_ID — Audience ID from Mailchimp → Audience → Settings → Audience name & defaults
//    MAILCHIMP_DC          — Data center prefix from your API key (e.g. 'us21')
//
//  ── 'webhook' ──────────────────────────────────────────────
//  POSTs { email } as JSON to any URL you control — useful for
//  n8n, Zapier, Make, or a custom integration.
//  Required env vars:
//    NEWSLETTER_WEBHOOK_URL    — full HTTPS URL to POST to
//    NEWSLETTER_WEBHOOK_SECRET — optional Bearer token added as
//                                Authorization: Bearer <secret>
//
// ============================================================

export type NewsletterProvider = 'shopify' | 'klaviyo' | 'mailchimp' | 'webhook';

export interface NewsletterConfig {
  // ─── Provider selector ─────────────────────────────────────────────────────
  // 'shopify'   → Storefront API (subscribers become Shopify Customers)
  // 'klaviyo'   → Klaviyo list (requires KLAVIYO_API_KEY + KLAVIYO_LIST_ID)
  // 'mailchimp' → Mailchimp audience (requires MAILCHIMP_* vars)
  // 'webhook'   → custom HTTP endpoint (requires NEWSLETTER_WEBHOOK_URL)
  provider: NewsletterProvider;

  // ─── Section copy (controls the visible text in the Newsletter section) ────
  eyebrow: string;
  title: string;   // wrap a word in *asterisks* to make it italic
  body: string;
  successMessage: string;
}

// ============================================================
//  Newsletter Popup Configuration
//
//  The popup is a fixed bottom-left card that slides up after
//  a configurable delay. Once closed (or after a successful
//  subscription), it won't reappear for `dontShowAgainDays` days
//  (stored in localStorage under the key 'omnix-nl-popup').
//
//  Display trigger options:
//    displayDelay      — seconds after page load before the popup
//                        slides in (0 = immediate). Default: 4.
//    showOnExitIntent  — also triggers on desktop when the cursor
//                        leaves the viewport toward the top of the
//                        page (classic exit-intent pattern).
//    dontShowAgainDays — after closing or subscribing, suppress
//                        the popup for this many days. Default: 7.
//
// ============================================================

export interface NewsletterPopupConfig {
  // ─── Global toggle ─────────────────────────────────────────────────────────
  // Set to false to disable the popup entirely across all pages.
  enabled: boolean;

  // ─── Content ───────────────────────────────────────────────────────────────
  // eyebrow    — small uppercase label above the heading (e.g. "Before you go")
  // heading    — main headline; wrap a word in *asterisks* for italic clay text
  // description — body copy below the heading
  // emailPlaceholder — placeholder text inside the email input
  // buttonText  — label on the subscribe button
  eyebrow: string;
  heading: string;
  description: string;
  emailPlaceholder: string;
  buttonText: string;

  // ─── Feedback messages ─────────────────────────────────────────────────────
  // successMessage — shown inside the form after a successful subscription
  // errorMessage   — fallback used when the server returns no specific message
  successMessage: string;
  errorMessage: string;

  // ─── Display rules ─────────────────────────────────────────────────────────
  // displayDelay      — seconds after DOM-ready before the popup appears (0 = instant)
  displayDelay: number;
  // showOnExitIntent  — fire popup when the mouse exits the top of the viewport
  //                     (desktop only; ignored on touch devices)
  showOnExitIntent: boolean;
  // dontShowAgainDays — suppress the popup for this many days after close / subscribe
  dontShowAgainDays: number;

  // ─── Optional image ────────────────────────────────────────────────────────
  // image    — URL of an image rendered above the eyebrow (leave empty to hide)
  // imageAlt — accessible alt text for that image
  image?: string;
  imageAlt?: string;
}

// ============================================================
//  Active newsletter configuration — edit these objects.
// ============================================================

export const NEWSLETTER: NewsletterConfig = {
  // ← Change this to 'klaviyo' | 'mailchimp' | 'webhook' to switch providers.
  provider: 'shopify',

  // ─── Section copy ──────────────────────────────────────────────────────────
  eyebrow: 'A letter, weekly',
  title: 'Join *the Edit*.',
  body: 'One considered email a week — buying guides, early drops, and the products our editors actually recommend. No noise.',
  successMessage: "You're on the list — watch your inbox.",
};

export const NEWSLETTER_POPUP: NewsletterPopupConfig = {
  // ─── Toggle ────────────────────────────────────────────────────────────────
  enabled: true,

  // ─── Content ───────────────────────────────────────────────────────────────
  eyebrow: 'Before you go',
  heading: 'A weekly letter from *the editors*.',
  description: 'One email, every Friday. Curated picks, honest reviews, and 10% off your first order.',
  emailPlaceholder: 'your@email.com',
  buttonText: 'Subscribe',

  // ─── Feedback messages ─────────────────────────────────────────────────────
  successMessage: "You're on the list. See you Friday.",
  errorMessage: 'Something went wrong — please try again.',

  // ─── Display rules ─────────────────────────────────────────────────────────
  displayDelay: 4,         // seconds after page load
  showOnExitIntent: true,  // also trigger on desktop cursor-exit
  dontShowAgainDays: 7,    // days to suppress after close / subscribe

  // ─── Optional image ────────────────────────────────────────────────────────
  // image: '/images/newsletter-popup.jpg',
  // imageAlt: 'The weekly edit',
};
