// ============================================================
//  Departments section — configuration
//  All options below are user-editable. Each one has a comment
//  explaining what it controls and how to change it.
// ============================================================

export const DEPARTMENTS_CONFIG = {

  // ── 1. Collection limit ───────────────────────────────────
  // How many department rows to display in the section.
  // Default: 6 (matches the design). Increase for more rows.
  collectionLimit: 6,

  // ── 2. Description word limit ─────────────────────────────
  // Maximum number of words shown from a collection's description.
  // The text is truncated cleanly with an ellipsis after this many words.
  // Set to 0 to disable truncation and show the full description.
  descriptionWordLimit: 10,

  // ── 3. Custom collection selection ────────────────────────
  // Leave as an empty array ([]) to automatically show ALL Shopify
  // collections (sorted A→Z by Shopify, up to collectionLimit above).
  //
  // To hand-pick collections AND control their display order, list them
  // here. Each entry may be EITHER:
  //   • a collection HANDLE — e.g. 'headphones'
  //   • a collection ID/gid — e.g. 'gid://shopify/Collection/123456789'
  // Handles and IDs can be mixed freely in the same list. Find the handle
  // in Shopify Admin → Collections (the URL slug); find the ID via the
  // Admin GraphQL/REST API. collectionLimit still applies as a max cap.
  //
  //   customCollections: ['headphones', 'gid://shopify/Collection/123', 'speakers'],
  //
  customCollections: ['sale', 'phone-tablet', 'pc-laptop', 'kitchen-appliances', 'home-appliances-1', 'accessories'] as string[],

  // ── 4. Hover image preview ────────────────────────────────
  // On desktop, hovering a department row slides in that collection's image.
  // This matches the Collections page 1:1 — the placement, size (140 × 92),
  // slide-in animation and shadow all come from the shared `.dept-row-img`
  // rule in src/styles/editorial.css. To restyle the preview (e.g. move it,
  // resize it), edit `.dept-row-img` there once and BOTH pages stay in sync.
  hoverImage: {
    // Master on/off switch for the hover preview.
    enabled: true,
  },

  // ── Section copy ─────────────────────────────────────────
  // Left-column editorial text. Edit freely — none of this is
  // pulled from Shopify; it lives here so copywriters can change
  // it without touching component code.
  label:     'The Edit · No. 06',
  heading:   'Browse by',
  headingEm: 'department',
  body: 'Six carefully selected departments — each one curated by our editors with intent. No bloated catalogues, no filler products, just the gear worth your attention this season.',
  ctaLabel:  'View all departments',
  ctaHref:   '/collections',

};
