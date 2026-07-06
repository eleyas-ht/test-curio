// ============================================================
//  Static editorial image registry.
//  Eager-globs src/assets/images/* so components can look images up
//  by filename (handles spaces / unicode the import syntax can't),
//  while still getting Astro's <Image> optimization (webp/avif,
//  responsive srcset, no CLS). Product/collection imagery comes
//  from the Shopify CDN instead — this is for marketing art only.
// ============================================================
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,png,JPG,PNG}',
  { eager: true },
);

const registry: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(files)) {
  const name = path.split('/').pop();
  if (name) registry[name] = mod.default;
}

/** Resolve an editorial image by filename, or `undefined` if missing. */
export function img(name: string): ImageMetadata | undefined {
  return registry[name];
}

/**
 * Resolve an image reference to a URL string, sourced from the bundled
 * `src/assets/images` pipeline (optimized, hashed) instead of `/public`.
 *
 * Accepts either a bare filename (`'blog-1.jpg'`) or a legacy public path
 * (`'/images/blog-1.jpg'`) and looks it up by filename in the registry.
 * Remote URLs (http/https/protocol-relative) and data URIs pass through
 * unchanged, so Shopify CDN images and inline data are safe to wrap.
 * Unknown local names fall back to the original string so nothing silently
 * disappears.
 *
 * Use this at render/data-build sites (raw `<img src>`, React island props,
 * client-serialized JSON) where Astro's `<Image>` component can't be used.
 */
export function imgUrl(ref: string | null | undefined): string {
  if (!ref) return '';
  if (/^(https?:)?\/\//i.test(ref) || ref.startsWith('data:')) return ref;
  const name = ref.split('/').pop() ?? ref;
  return registry[name]?.src ?? ref;
}

/** True if the named editorial image exists. */
export function hasImg(name: string): boolean {
  return name in registry;
}

/** All registered editorial image filenames (useful for galleries). */
export function imageNames(): string[] {
  return Object.keys(registry);
}
