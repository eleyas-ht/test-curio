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

/** True if the named editorial image exists. */
export function hasImg(name: string): boolean {
  return name in registry;
}

/** All registered editorial image filenames (useful for galleries). */
export function imageNames(): string[] {
  return Object.keys(registry);
}
