// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import netlify from "@astrojs/netlify";

function getAdapter() {
  const target = process.env.ASTRO_ADAPTER;
  if (target === "node") {
    return node({ mode: "standalone" });
  }
  if (target === "vercel" || process.env.VERCEL === "1" || process.env.VERCEL === "true") {
    return vercel();
  }
  if (target === "netlify" || process.env.NETLIFY === "true") {
    return netlify();
  }
  if (target === "cloudflare" || process.env.CF_PAGES === "1") {
    return cloudflare({ imageService: "compile" });
  }
  // Default fallback
  return cloudflare({ imageService: "compile" });
}

// Headless Shopify storefront — server-rendered so the private
// Storefront token stays on the server and cart cookies work.
// Deployed to Cloudflare Workers (workerd runtime).
// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://your-domain.com",
  output: "server",
  adapter: getAdapter(),
  session: {
    driver: sessionDrivers.lruCache(),
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // Allow the tunnel host to reach the dev server (otherwise Vite
    // blocks unknown Host headers). localhost is always allowed.
    server: {
      allowedHosts: true,
    },
    // Force Vite to pre-bundle React to ESM so islands get the
    // named `createRoot` export, and dedupe to a single copy.
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
});
