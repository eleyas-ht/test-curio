// ============================================================
//  Instagram Section Configuration
//
//  Two modes:
//
//  'api'     → fetches live posts from the Instagram Basic Display API
//              using INSTAGRAM_ACCESS_TOKEN from your environment.
//              Requires a long-lived access token (valid ~60 days,
//              renewable). Falls back to customPosts if the token is
//              missing or the API call fails.
//
//              How to get a token:
//              1. Create a Facebook/Meta App at developers.facebook.com
//              2. Add the "Instagram Basic Display" product
//              3. Generate a short-lived token, then exchange it for a
//                 long-lived token (valid 60 days)
//              4. Add INSTAGRAM_ACCESS_TOKEN=<token> to your .env file
//              5. Refresh the token before it expires (call the refresh
//                 endpoint: graph.instagram.com/refresh_access_token)
//
//  'custom'  → uses the customPosts array below; no API call.
//              Update these entries to change what is shown.
//
// ============================================================

import { imgUrl } from '~/lib/assets';

export type InstagramMode = 'api' | 'custom';

export interface InstagramPost {
  // Path relative to /public, or a full URL
  image: string;
  // Alt text for accessibility — describe the image content
  alt: string;
  // Optional — link opens when the post is clicked. Set to your Instagram
  // post URL or any relevant destination. Omit to make the post non-clickable.
  href?: string;
}

export interface InstagramConfig {
  // ─── Mode selector ─────────────────────────────────────────────────────────
  // 'api'    → live Instagram posts via Basic Display API
  // 'custom' → manually defined posts below (no API call)
  mode: InstagramMode;

  // ─── Profile identity ──────────────────────────────────────────────────────
  // Shown in the section header.
  handle: string;       // e.g. '@yourbrand' — displayed next to the Instagram icon
  profileUrl: string;   // full Instagram profile URL for the "Follow on Instagram" button

  // ─── API mode settings (only used when mode === 'api') ─────────────────────
  // How many posts to request from the API and display in the grid.
  postCount: number;

  // ─── Custom posts (used when mode === 'custom', or as API fallback) ─────────
  // Define your posts manually. Shown in order, left-to-right.
  customPosts: InstagramPost[];
}

// ============================================================
//  Active Instagram configuration
// ============================================================

export const INSTAGRAM: InstagramConfig = {
  mode: 'custom',  // ← 'api' | 'custom'

  handle: '@amaraakhonelectronics',
  profileUrl: 'https://www.instagram.com/amaraakhonelectronics/',

  // Number of posts to fetch when mode === 'api' (max 20 per request)
  postCount: 6,

  // ── Custom posts (used when mode === 'custom', or as fallback for 'api') ───
  // Replace images and hrefs with your own. Use full Instagram post URLs for
  // href, or link to any relevant page. Remove href entirely to disable clicks.
  customPosts: [
    {
      image: imgUrl('/images/editorial-instagram-01.jpg'),
      alt: 'Product lifestyle shot 1',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
    {
      image: imgUrl('/images/editorial-instagram-02.jpg'),
      alt: 'Product lifestyle shot 2',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
    {
      image: imgUrl('/images/editorial-instagram-03.jpg'),
      alt: 'Product lifestyle shot 3',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
    {
      image: imgUrl('/images/editorial-instagram-04.jpg'),
      alt: 'Product lifestyle shot 4',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
    {
      image: imgUrl('/images/editorial-instagram-05.jpg'),
      alt: 'Product lifestyle shot 5',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
    {
      image: imgUrl('/images/editorial-instagram-06.jpg'),
      alt: 'Product lifestyle shot 6',
      href: 'https://www.instagram.com/amaraakhonelectronics/',
    },
  ],
};
