import { expect, test, type Page } from "@playwright/test";
import { openUniverseMobileMenu } from "./helpers/universeNavigation";

const UNIVERSE_CHRONICLE_CDN_URL =
  "https://media.cosmos-universe.com/blog/hero/universe-chronicle-terminal.png";
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL5SAAAAABJRU5ErkJggg==",
  "base64",
);

async function mockUniverseChronicleImage(page: Page, status: 200 | 404) {
  await page.route(UNIVERSE_CHRONICLE_CDN_URL, async (route) => {
    await route.fulfill(
      status === 200 ? { status, contentType: "image/png", body: ONE_PIXEL_PNG } : { status },
    );
  });
}

test("opens the Universe Chronicle from shared navigation with an active Blog link", async ({
  page,
}) => {
  await mockUniverseChronicleImage(page, 200);
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "CosmoPort Universe" })
    .getByRole("link", { name: "Blog", exact: true })
    .click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.locator("#universe-chronicle-title")).toHaveText("The Universe Chronicle");
  await expect(page.locator(".universe-blog__artwork")).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "CosmoPort Universe" })
      .getByRole("link", { name: "Blog", exact: true }),
  ).toHaveClass(/router-link-exact-active/);
});

test("keeps the Chronicle kiosk hero within the viewport at representative widths", async ({
  page,
}) => {
  await mockUniverseChronicleImage(page, 200);

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/blog");

    const image = page.locator(".universe-blog__artwork");
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("object-fit", "cover");
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
    expect(
      await page.evaluate(() => {
        const hero = document.querySelector(".universe-blog__hero")?.getBoundingClientRect();
        return Boolean(
          hero &&
          hero.width === window.innerWidth &&
          hero.height >= window.innerHeight &&
          document.documentElement.scrollWidth <= window.innerWidth,
        );
      }),
    ).toBe(true);
  }
});

test("shows the Chronicle fallback when the hero artwork is unavailable", async ({ page }) => {
  await mockUniverseChronicleImage(page, 404);
  await page.goto("/blog");

  await expect(page.locator(".universe-blog__artwork")).toHaveCount(0);
  await expect(page.locator(".universe-blog__fallback")).toBeVisible();
  await expect(
    page.getByText("Engineering logs, cosmic dispatches, and stories from tomorrow."),
  ).toBeVisible();
});

test("renders the Latest Dispatches section beneath the Chronicle hero", async ({ page }) => {
  await mockUniverseChronicleImage(page, 200);
  await page.goto("/blog");

  await expect(page.getByRole("heading", { name: "Latest Dispatches" })).toBeVisible();
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
