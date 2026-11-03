import { spawnSync } from "node:child_process";
import { assertDevelopmentClerkEnvironment, assertRecordedClerkTestUsersDeleted, cleanupClerkTestUsers } from "./clerk-test-users.mjs";

const publishableKey = process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.NUXT_CLERK_SECRET_KEY;
process.env.CLERK_PUBLISHABLE_KEY = publishableKey;
process.env.CLERK_SECRET_KEY = secretKey;
await assertDevelopmentClerkEnvironment();
const env = { ...process.env };
const status = await (async () => {
  try {
    return spawnSync("npx", ["playwright", "test", "--config", "playwright.clerk.config.ts"], {
      stdio: "inherit",
      env,
    }).status ?? 1;
  } finally {
    await cleanupClerkTestUsers();
    await assertRecordedClerkTestUsersDeleted();
  }
})();
process.exitCode = status;
