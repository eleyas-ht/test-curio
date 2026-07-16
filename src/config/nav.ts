// ============================================================
//  Navigation Configuration
//
//  NAV_SOURCE controls which menu the header uses:
//
//    'shopify'  — fetch "main-menu" from Shopify Admin →
//                 Online Store → Navigation → Main menu.
//                 Falls back to CUSTOM_NAV on API error.
//
//    'custom'   — always use CUSTOM_NAV below, even when
//                 Shopify is configured. Edit items here.
//
//  Change this one value to switch between sources:
// ============================================================

export type NavSource = 'shopify' | 'custom';

export const NAV_SOURCE: NavSource = 'shopify';

// ============================================================
//  NavItem — 3-level nesting (top → dropdown → mega columns)
//
//    No items   → plain link
//    items      → dropdown menu
//    items with their own items → mega menu (column per item)
//
//  Add `sale: true` to apply the clay accent colour.
// ============================================================

export interface NavItem {
  title: string;
  url: string;
  sale?: boolean;
  items?: NavItem[];
}

// ============================================================
//  CUSTOM_NAV
//
//  Managed here when NAV_SOURCE = 'custom', or used as the
//  fallback when Shopify's main-menu cannot be fetched.
//
//  Edit titles and URLs freely. Nest items to create dropdowns
//  and mega menus. Supported URL types:
//    /products               → all products
//    /products?sort=newest   → filtered products
//    /collections/handle     → a collection
//    /pages/handle           → a CMS page
//    /blogs/journal          → a blog
//    https://example.com     → external link
// ============================================================

export const CUSTOM_NAV: NavItem[] = [
  {
    title: 'Home',
    url: '/',
  },
  {
    title: 'Shop',
    url: '/collections',
    items: [
      {
        title: 'Audio',
        url: '#',
        items: [
          { title: 'Headphones', url: '/collections/headphones' },
          { title: 'Earbuds', url: '/collections/smart-home' },
          { title: 'Speakers', url: '/collections/speakers' },
        ],
      },
      {
        title: 'Cameras',
        url: '#',
        items: [
          { title: 'Mirrorless', url: '/collections/phone-tablet' },
          { title: 'Compact', url: '/collections/pc-laptop' },
          { title: 'Accessories', url: '/collections/accessories' },
        ],
      },
      {
        title: 'Computing',
        url: '#',
        items: [
          { title: 'Laptops', url: '/collections/pc-laptop' },
          { title: 'Tablets', url: '/collections/phone-tablet' },
          { title: 'Accessories', url: '/collections/accessories' },
        ],
      },
    ],
  },
  {
    title: 'Products',
    url: '/products',
    items: [
      {
        title: 'Audio',
        url: '#',
        items: [
          { title: 'Zackpot Speaker', url: '/products/zackpot-speaker' },
          { title: 'Network Bridges', url: '/products/network-bridges-x1' },
          { title: 'Speakers', url: '/products/zackpot-speaker-1' },
        ],
      },
      {
        title: 'Cameras',
        url: '#',
        items: [
          { title: 'Decorex', url: '/products/decorex-d25-camera' },
          { title: 'Compact', url: '/products/kb-phone-15-pro' },
          { title: 'Xonic', url: '/products/xonic-cc-camera' },
        ],
      },
      {
        title: 'Computing',
        url: '#',
        items: [
          { title: 'Laptops', url: '/products/packbook-pro-15inch' },
          { title: 'Tablets', url: '/products/kb-phone-15-pro' },
          { title: 'Accessories', url: '/products/ornex-blender' },
        ],
      },
    ],
  },
  {
    title: 'Pages',
    url: '#',
    items: [
      { title: 'Blog', url: '/blogs/news' },
      { title: 'About us', url: '/about' },
      { title: 'Contact us', url: '/contact' },
      { title: 'FAQ s', url: '/faq' },
      { title: 'Teams', url: '/team'},
    ],
  },
  { title: 'Contact', url: '/contact'},
];

// Kept for backwards compatibility — CUSTOM_NAV is the canonical export.
export const FALLBACK_NAV = CUSTOM_NAV;
