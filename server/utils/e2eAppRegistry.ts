import type { CosmoportApp } from "../../shared/types/cosmoportApp";

// Development-only fixtures for Playwright's no-secrets dev server.
// Production handlers never use them: they require both import.meta.dev and PLAYWRIGHT_TEST.
const apps: CosmoportApp[] = [
  {
    id: "astro-pop",
    title: "Astro Pop Soda Co.",
    description: "A retro-futuristic soda shop serving the universe.",
    enabled: true,
  },
  {
    id: "cosmoport-voyage",
    title: "CosmoPort Voyage",
    description: "Explore extraordinary destinations across the cosmos.",
    enabled: false,
  },
];

export const getE2eApps = (): CosmoportApp[] => apps;
export const getE2eAppEnabled = (id: string): boolean | null =>
  apps.find((app) => app.id === id)?.enabled ?? null;
