Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
import { expect, test } from "@playwright/test";
import { openUniverseMobileMenu } from "./helpers/universeNavigation";

test("opens the Universe Chronicle from shared navigation with an active Blog link", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "CosmoPort Universe" })
    .getByRole("link", { name: "Blog", exact: true })
    .click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("heading", { name: "The Universe Chronicle" })).toBeVisible();
  await expect(
    page.getByText("Engineering logs, cosmic dispatches, and stories from tomorrow."),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "CosmoPort Universe" })
      .getByRole("link", { name: "Blog", exact: true }),
  ).toHaveClass(/router-link-exact-active/);
});

test("opens the Universe Chronicle from the mobile navigation with an active Blog link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  await (
    await openUniverseMobileMenu(page)
  )
    .getByRole("link", { name: "Blog", exact: true })
    .click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    (await openUniverseMobileMenu(page)).getByRole("link", { name: "Blog", exact: true }),
  ).toHaveClass(/router-link-exact-active/);
});
