<p align="center">
<img src="src/assets/images/logo.png" alt="Curio Logo" width="200" />
</p>
<h1 align="center">Curio · The Edit — Editorial Headless Shopify Storefront</h1>
<p align="center">
  A production eCommerce template built with Astro 6 (SSR), React 19 islands, nanostores, and Tailwind CSS v4, powered end-to-end by the Shopify Storefront API 2026-04.
</p>
<p align="center">
<a href="#features">Features</a> |
<a href="#pages">Pages</a> |
<a href="#getting-started">Getting Started</a> |
<a href="#customization">Customization</a> |
<a href="#project-structure">Project Structure</a> |
<a href="#license">License</a>
</p>
<p align="center">
<img src="src/assets/images/curio-preview.png" alt="Curio Preview" width="100%" />
</p>

---

## Features

- Astro 6 with SSR via `@astrojs/node` and React 19 islands.
- Tailwind CSS v4 with editorial design tokens (`@theme` in `src/styles/global.css`).
- Framework-agnostic cart via nanostores (`src/stores/cart.ts`) — header badge, drawer, and cart page stay in sync.
- Security invariant: the browser never talks to Shopify directly — all traffic uses a private Storefront token through server code; the client only calls same-origin `/api/*`.
- Native faceted filters (Brand, Availability, Size, Color, Price with counts), sort, and pagination on collection pages.
- Full product search and predictive search via `/api/search`.
- SEO metadata, Open Graph/Twitter cards, canonical URLs in `src/layouts/BaseLayout.astro`.
- Design direction: Editorial / Alpine Technical Catalogue — warm cream paper, ink + clay accent, **Newsreader** serif headlines with **Inter** for body/UI.

---

## Pages

### Main

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/products` | `src/pages/products.astro` |
| `/collections` | `src/pages/collections/index.astro` |
| `/collections/[handle]` | `src/pages/collections/[handle].astro` |
| `/products/[handle]` | `src/pages/products/[handle].astro` |
| `/about` | `src/pages/about.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/cart` | `src/pages/cart.astro` |
| `/search` | `src/pages/search.astro` |
| `/pages/[handle]` | `src/pages/pages/[handle].astro` |

### Account

| Route | File |
| --- | --- |
| `/account/*` | `src/pages/account/` |

---

## Getting Started

### Prerequisites

- Node.js >= 22.12.0
- yarn

### Install

```bash
yarn install
cp .env.example .env     # fill in Shopify Storefront credentials
```

### Development

```bash
yarn dev                 # → http://localhost:4321
```

### Build

```bash
yarn build               # standalone Node server → dist/server/entry.mjs
```

### Preview

```bash
yarn preview
```

Run the production server with:

```bash
HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```

---

## Customization

### Environment Variables

All Shopify config is server-only (no `PUBLIC_` prefix) — the private token never ships to the browser. See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SHOPIFY_SHOP_DOMAIN` | Yes | Your Shopify store domain |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Yes | Private Storefront API token |
| `SHOPIFY_API_VERSION` | Yes | Set to `2026-04` |
| `CUSTOMER_ACCOUNT_API_*` | No | Customer login only |
| `SHOPIFY_SHOP_ID` | No | Customer login only |

### Design Tokens and Typography

- Design tokens live in `src/styles/global.css` (`@theme`).
- The boilerplate's original class names are aliased to the editorial palette for safety.

### Page Content Data

- Static marketing imagery: `src/assets/images/` (rendered via Astro `<Image>` — webp/avif + srcset)
- Demo video: `public/video/`

### Data Layer

Edit the Shopify data layer in `src/lib/shopify/`:

- `src/lib/shopify/client.ts`
- `src/lib/shopify/graphql/`
- `src/lib/shopify/services/`
- `src/lib/shopify/transforms.ts`
- `src/lib/shopify/types.ts`

---

## Project Structure

```
public/
  video/              # Demo video assets
  favicon.svg
  robots.txt
src/
  assets/
    images/           # Optimized images (processed by Astro)
  components/         # Astro + React section and UI components
  layouts/
    BaseLayout.astro  # HTML shell, head, meta, SEO
  lib/
    shopify/          # Shopify data layer (client, graphql, services, transforms)
    filters.ts        # Server-rendered, URL-driven faceted filters
    cart-server.ts    # httpOnly cart-id cookie + self-healing cart logic
  pages/              # All page routes
  stores/
    cart.ts           # Framework-agnostic nanostore cart
  styles/
    global.css        # Design tokens (@theme), base styles, editorial palette
astro.config.mjs
package.json
tailwind.config.js
tsconfig.json
.env.example
```

---

## Architecture Notes

### What's Live vs. Stub

| Feature | Status |
| --- | --- |
| Products, collections, cart, search, variants, real stock (`quantityAvailable`), PDP description | **Live Shopify data** |
| Faceted filters with counts (collection pages) | **Live** (native Shopify facets) |
| PDP specs | Derived from native fields (vendor, type, tags, variants) |
| PDP video / reviews & ratings, per-category counts, countdown, bundles, journal, team | **Static / placeholder** |
| `/api/newsletter`, `/api/contact` | **Validated stubs** — wire to your ESP / helpdesk |

To make PDP specs/video/reviews fully data-driven, enable product metafields with Storefront API access and extend `PRODUCT_FRAGMENT` per `CONVERSION-PLAN.md` §4.2.

---

## Tech Stack

| Dependency | Version | Purpose |
| --- | --- | --- |
| Astro | ^6 | Static site framework (SSR) |
| React | ^19 | UI islands |
| Tailwind CSS | ^4 | Styling |
| @astrojs/node | ^10 | SSR adapter |
| @astrojs/react | ^4 | React integration |
| nanostores | — | Framework-agnostic state (cart) |

> `astro@6` ⇄ `@astrojs/node@^10` ⇄ `@astrojs/react@^4`, `react@19` are mutually pinned — bumping individually breaks the build.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Start the development server |
| `yarn build` | Build the production site (Node server) |
| `yarn preview` | Preview the production build |

---

## License

This project is released under the MIT License. See `LICENSE`.
