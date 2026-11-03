import { expect, test } from "@playwright/test";

test("redirects signed-out visitors away from /admin before the dashboard renders", async ({
  page,
}) => {
  // Standard E2E mode intentionally disables Clerk.
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".admin-layout")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toHaveCount(0);
});
