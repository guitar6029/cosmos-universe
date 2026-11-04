import { expect, test, type Page } from "@playwright/test";
import { openUniverseMobileMenu } from "./helpers/universeNavigation";

const GRAND_CONCOURSE_CDN_URL =
  "https://media.cosmos-universe.com/grand-concourse/cosmoport-grand-concourse.png";
const GRAND_CONCOURSE_ALT =
  "Illustrated CosmoPort Grand Concourse terminal, with travelers, a central CosmoPort sign, and the AstroPop Soda Co. storefront.";
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL5SAAAAABJRU5ErkJggg==",
  "base64",
);

async function mockGrandConcourseImage(page: Page, status: 200 | 404) {
  await page.route(GRAND_CONCOURSE_CDN_URL, async (route) => {
    await route.fulfill(
      status === 200 ? { status, contentType: "image/png", body: ONE_PIXEL_PNG } : { status },
    );
  });
}

test("presents AstroPop as the only active Grand Concourse experience", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Explore the Concourse" })).toHaveAttribute(
    "href",
    "#concourse",
  );
  await expect(page.getByRole("link", { name: "Enter Astro Pop Soda Co." })).toHaveAttribute(
    "href",
    "/app/astro-pop",
  );
  await expect(page.getByText("Under Construction", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/app/cosmoport-voyage"]')).toHaveCount(0);

  await page.getByRole("link", { name: "Enter Astro Pop Soda Co." }).click();
  await expect(page).toHaveURL(/\/app\/astro-pop$/);
});

test("renders the Grand Concourse illustration when the CDN returns a valid PNG", async ({
  page,
}) => {
  await mockGrandConcourseImage(page, 200);
  await page.goto("/");

  const image = page.locator(".grand-concourse__hero-art img");
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", GRAND_CONCOURSE_CDN_URL);
  await expect(image).toHaveAttribute("alt", GRAND_CONCOURSE_ALT);
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(
    0,
  );
});

test("shows the designed fallback when the Grand Concourse image is unavailable", async ({
  page,
}) => {
  await mockGrandConcourseImage(page, 404);
  await page.goto("/");

  await expect(page.locator(".grand-concourse__hero-fallback")).toBeVisible();
  await expect(page.locator(".grand-concourse__hero-art img")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore the Concourse" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter Astro Pop Soda Co." })).toHaveAttribute(
    "href",
    "/app/astro-pop",
  );
});

test("keeps the hero, auth navigation, and content free of horizontal overflow", async ({
  page,
}) => {
  await mockGrandConcourseImage(page, 200);

  for (const width of [320, 375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect(page.locator(".grand-concourse__hero-art img")).toBeVisible();
    const navigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
    await expect(navigation.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/passport-office?intent=sign-in",
    );
    await expect(navigation.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/passport-office?intent=register",
    );

    if (width <= 768) {
      const mobileMenu = await openUniverseMobileMenu(page);
      await expect(mobileMenu.getByRole("link", { name: "Home", exact: true })).toHaveAttribute(
        "href",
        "/",
      );
      await expect(mobileMenu.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
        "href",
        "/about",
      );
      await expect(mobileMenu.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
        "href",
        "/blog",
      );
    } else {
      await expect(navigation.getByRole("link", { name: "Home", exact: true })).toHaveAttribute(
        "href",
        "/",
      );
      await expect(navigation.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
        "href",
        "/about",
      );
      await expect(navigation.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
        "href",
        "/blog",
      );
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test("shows the complete hero artwork at every viewport width", async ({ page }) => {
  await mockGrandConcourseImage(page, 200);

  for (const width of [320, 375, 768, 900, 1024, 1200, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const image = page.locator(".grand-concourse__hero-art img");
    const cta = page.getByRole("link", { name: "Explore the Concourse" });
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect(cta).toHaveCSS("position", "relative");
    expect(
      await page.evaluate(() => {
        const imageRect = document
          .querySelector(".grand-concourse__hero-art img")
          ?.getBoundingClientRect();
        const ctaRect = document
          .querySelector(".grand-concourse__scroll-link")
          ?.getBoundingClientRect();
        return Boolean(
          imageRect &&
          ctaRect &&
          imageRect.width <= window.innerWidth &&
          ctaRect.top >= imageRect.bottom &&
          document.documentElement.scrollWidth <= window.innerWidth,
        );
      }),
    ).toBe(true);
  }
});

test("keeps every signed-out navigation control usable at 320px", async ({ page }) => {
  await mockGrandConcourseImage(page, 200);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
  const signIn = navigation.getByRole("link", { name: "Sign In" });
  const register = navigation.getByRole("link", { name: "Register" });

  await expect(navigation.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
  await expect(signIn).toBeVisible();
  await expect(register).toBeVisible();
  await expect(signIn).toHaveAttribute("href", "/passport-office?intent=sign-in");
  await expect(register).toHaveAttribute("href", "/passport-office?intent=register");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  const menu = await openUniverseMobileMenu(page);
  await expect(menu.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "About", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
  await expect(menu.getByRole("button", { name: "Open CosmoPort Radio controls" })).toBeVisible();

  await menu.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);

  await (
    await openUniverseMobileMenu(page)
  )
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);

  await (
    await openUniverseMobileMenu(page)
  )
    .getByRole("link", { name: "Blog", exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog$/);

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "CosmoPort Universe" })
    .getByRole("link", { name: "Sign In" })
    .click();
  await expect(page).toHaveURL(/\/passport-office\?intent=sign-in$/);
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "CosmoPort Universe" })
    .getByRole("link", { name: "Register" })
    .click();
  await expect(page).toHaveURL(/\/passport-office\?intent=register$/);
});

test("keeps the navigation over the hero and sticky through the concourse", async ({ page }) => {
  await mockGrandConcourseImage(page, 200);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const header = page.locator(".grand-concourse__header");
  const navigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
  await expect(header).toHaveCSS("position", "sticky");
  await page.locator("#concourse").scrollIntoViewIfNeeded();
  await expect(navigation).toBeVisible();
  expect(
    await navigation.evaluate((element) => Math.abs(element.getBoundingClientRect().top - 12) < 1),
  ).toBe(true);
});

// Optional manual smoke check (never run in standard CI):
// RUN_GRAND_CONCOURSE_CDN_SMOKE=true npx playwright test e2e/universe-home.spec.ts --grep "real Grand Concourse CDN"
test("optional manual smoke check for the real Grand Concourse CDN", async ({ page }) => {
  test.skip(
    process.env.RUN_GRAND_CONCOURSE_CDN_SMOKE !== "true",
    "Set RUN_GRAND_CONCOURSE_CDN_SMOKE=true to exercise the live CDN.",
  );
  await page.goto("/");

  const image = page.locator(".grand-concourse__hero-art img");
  await expect(image).toHaveAttribute("src", GRAND_CONCOURSE_CDN_URL);
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(
    0,
  );
});
