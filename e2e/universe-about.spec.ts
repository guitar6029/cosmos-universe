import { expect, test } from "@playwright/test";
import { openUniverseMobileMenu } from "./helpers/universeNavigation";

test.describe("CosmoPort Universe About page", () => {
  test("opens About from the floating Universe navigation", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "CosmoPort Universe" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("opens About from the mobile Universe navigation", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");

    await (
      await openUniverseMobileMenu(page)
    )
      .getByRole("link", { name: "About", exact: true })
      .click();

    await expect(page).toHaveURL(/\/about$/);
  });

  test("offers a route back to the Universe home", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: /One Universe/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Visit Astro Pop/ })).toHaveAttribute(
      "href",
      "/app/astro-pop",
    );
    await expect(page.getByText("In development", { exact: true })).toBeVisible();
    await expect(page.locator(".universe-multiverse-collage img")).toHaveCount(6);

    await page.getByRole("link", { name: /Return to the Universe/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("keeps the collage in the viewport without horizontal overflow on representative widths", async ({
    page,
  }) => {
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");
      await expect(page.locator(".universe-multiverse-collage img")).toHaveCount(6);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
  });

  test("keeps the matching Universe navigation sticky while the page scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const header = page.locator(".universe-about__header");
    const navigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
    await expect(header).toHaveCSS("position", "sticky");
    await expect(navigation.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
      "href",
      "/about",
    );
    await page.locator(".universe-about__engineering").scrollIntoViewIfNeeded();
    await expect(navigation).toBeVisible();
    expect(
      await navigation.evaluate(
        (element) => Math.abs(element.getBoundingClientRect().top - 12) < 1,
      ),
    ).toBe(true);
  });
});
