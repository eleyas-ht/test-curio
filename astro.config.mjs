// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// Headless Shopify storefront — server-rendered so the private
// Storefront token stays on the server and cart cookies work.
// Deployed to Cloudflare Workers (workerd runtime).
// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://your-domain.com",
  output: "server",
  adapter: cloudflare({
    // Optimize local images at build time instead of using the runtime
    // Cloudflare Images binding, so no Images product setup is required.
    imageService: "compile",
  }),
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
