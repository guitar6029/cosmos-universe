import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { SITE_DESCRIPTION, SITE_TITLE } from "./app/site";
import astroPopDatabaseHealth from "./server/dev-handlers/astroPopDatabaseHealth";

const usePlaywrightAuthMock = process.env.PLAYWRIGHT_TEST === "true";
const playwrightAuthMock = fileURLToPath(new URL("./e2e/support/clerk-mock.ts", import.meta.url));
const playwrightServerAuthMock = fileURLToPath(
  new URL("./e2e/support/clerk-server-mock.ts", import.meta.url),
);

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/sanity",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@nuxt/eslint",
    ...(usePlaywrightAuthMock ? [] : ["@clerk/nuxt"]),
  ],
  clerk: {
    afterSignOutUrl: "/",
    // Playwright exercises existing guest flows without Doppler credentials in CI.
    skipServerMiddleware: process.env.PLAYWRIGHT_TEST === "true",
  },
  fonts: {
    families: [
      {
        name: "Fontdiner Swanky",
        provider: "google",
      },
      {
        name: "Cherry Cream Soda",
        provider: "google",
      },
      {
        name: "Fraunces",
        provider: "google",
        weights: [700, 900],
        styles: ["normal", "italic"],
      },
      {
        name: "Barlow",
        provider: "google",
        weights: [400],
      },
      {
        name: "Barlow Condensed",
        provider: "google",
        weights: [700],
      },
    ],
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    // Clerk dynamically imports its browser runtime. Pre-bundling its package
    // graph can leave stale hashed chunks in Vite's dependency cache, so serve
    // those ESM modules directly during development and E2E runs.
    optimizeDeps: {
      exclude: ["@clerk/vue", "@clerk/shared", "@clerk/clerk-js"],
    },
    server: {
      allowedHosts: ["trilogy-plant-unrefined.ngrok-free.dev"],
    },
    resolve: usePlaywrightAuthMock
      ? {
          alias: {
            "@clerk/nuxt/composables": playwrightAuthMock,
            "@clerk/nuxt/server": playwrightServerAuthMock,
          },
        }
      : undefined,
  },
  imports: usePlaywrightAuthMock
    ? {
        imports: [
          { from: playwrightAuthMock, name: "useAuth" },
          { from: playwrightAuthMock, name: "useUser" },
        ],
      }
    : undefined,
  nitro: {
    alias: usePlaywrightAuthMock ? { "@clerk/nuxt/server": playwrightServerAuthMock } : undefined,
    devHandlers: [
      {
        route: "/api/astro-pop/db-health",
        handler: astroPopDatabaseHealth,
      },
    ],
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: "2025-02-19",
  },
  app: {
    head: {
      ...(process.env.NODE_ENV === "production"
        ? { script: [{ src: "/_vercel/insights/script.js", defer: true }] }
        : {}),
      title: SITE_TITLE,
      meta: [
        { name: "description", content: SITE_DESCRIPTION },
        { property: "og:title", content: SITE_TITLE },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:type", content: "website" },
      ],
    },
  },
});
