import { env } from "node:process";
import { defineConfig, devices } from "@playwright/test";

const port = env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e/clerk",
  fullyParallel: false,
  globalTeardown: "./e2e/clerk-global-teardown.ts",
  use: { baseURL, screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/passport-office`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "clerk-setup", testMatch: /clerk\.setup\.ts/ },
    {
      name: "chromium",
      testIgnore: /clerk\.setup\.ts/,
      dependencies: ["clerk-setup"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
