<p align="center">
<img src="src/assets/images/logo.png" alt="Curio Logo" width="200" />
</p>
<h1 align="center">Curio — Astro Headless Shopify Storefront</h1>
<p align="center">
  A production eCommerce template built with Astro 6 (SSR), React 19 islands, nanostores powered end-to-end by the Shopify Storefront API 2026-04.
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

**Prerequisites:** Node.js `>= 22.12.0`, yarn, and a [Shopify store](https://www.shopify.com/partners).

### 1. Get your Shopify Storefront API token

1. Sign in to [Shopify Admin](https://accounts.shopify.com/store-login).
2. Install the **Headless** channel (**Settings → Apps and sales channels → Shopify App Store → Headless**).
3. Open the **Headless** channel and click **Add storefront**.
4. In **Storefront API**, reveal and copy the **Private access token** (starts with `shpat_`).
5. Note your `*.myshopify.com` store domain.

### 2. Install and configure

```bash
yarn install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

Set these values in `.env`:

```env
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2026-04
```

Optional integrations (customer login, reviews, Instagram, newsletter) are documented inline in [`.env.example`](.env.example).

### 3. Run

```bash
yarn dev                 # dev server → http://localhost:4321
yarn build               # production build → dist/server/entry.mjs
yarn preview             # preview the production build
```

See [Deployment](#deployment) for hosting on a VPS, Cloudflare, Vercel, or Netlify.

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

## Deployment

This template is fully **platform-agnostic** and can be deployed to Cloudflare, Vercel, Netlify, or a self-hosted Node.js VPS.

### Option 1: VPS (Node.js) / Docker
To deploy on a VPS (like DigitalOcean, Hetzner, AWS, etc.) using Node.js:

1. **Clone the repository** to your server.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**: Create a `.env` file in the root directory and ensure you set:
   ```env
   ASTRO_ADAPTER=node
   SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
   SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_...
   ```
4. **Build the application**:
   ```bash
   npm run build:node
   ```
5. **Start the standalone Node server**:
   - For basic testing:
     ```bash
     npm run start:node
     ```
   - **Using PM2** (Recommended for production process management):
     ```bash
     npm install -g pm2
     pm2 start dist/server/entry.mjs --name "curio-storefront"
     pm2 save
     pm2 startup
     ```
6. **Reverse Proxy (Nginx)**: Configure your Nginx block to reverse-proxy port `4321` (or the port set in `PORT` env var) to your domain:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:4321;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 2: Cloudflare Workers
Connect the repo to a Cloudflare Worker (Workers & Pages → Import a repository) and set the **Build** configuration exactly as below:
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`

---

### Option 3: Vercel & Netlify
Deploy directly through your hosting provider's dashboard by connecting your git repository. The runtime environment is auto-detected, so you do not need to configure the `ASTRO_ADAPTER` variable. Just add the Shopify credentials to your dashboard's environment variables.

---

## License

This project is released under the MIT License. See `LICENSE`.
