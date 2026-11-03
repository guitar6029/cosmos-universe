import { env } from "node:process";
import { defineConfig, devices } from "@playwright/test";

const port = env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: "**/clerk/**",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `PLAYWRIGHT_TEST=true npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/app/astro-pop/cart`,
    reuseExistingServer: !env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
