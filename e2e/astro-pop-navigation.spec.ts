import { expect, test } from "@playwright/test";

test.describe("AstroPop route-aware navigation", () => {
  test("renders order details responsively and returns to order history", async ({ page }) => {
    const orderId = "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab";
    const order = {
      id: orderId,
      createdAt: "2026-10-31T12:00:00.000Z",
      totalCents: 357,
      currency: "usd",
      status: "PLACED",
      paymentStatus: "PAID",
      items: [
        {
          flavorId: "atomic-cherry-fizz",
          flavorName: "Atomic Cherry Fizz",
          quantity: 3,
          unitPriceCents: 119,
        },
      ],
    };

    await page.addInitScript(() => {
      window.localStorage.setItem("playwright-clerk-authenticated", "true");
    });
    await page.route("**/api/astro-pop/account/session", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ authenticated: true }),
      }),
    );
    await page.route("**/api/astro-pop/account/orders", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([order]),
      }),
    );
    await page.route(`**/api/astro-pop/account/orders/${orderId}`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(order),
      }),
    );

    await page.goto("/app/astro-pop");
    await page.getByRole("link", { name: "Account" }).click();
    await expect(page).toHaveURL(/\/app\/astro-pop\/account$/);
    await page.getByRole("link", { name: /View details/i }).click();

    await expect(page).toHaveURL(new RegExp(`/app/astro-pop/account/orders/${orderId}$`));
    await expect(page.getByRole("heading", { name: /Order #F1C2D3E4/i })).toBeVisible();
    await expect(page.getByRole("img", { name: "Atomic Cherry Fizz" })).toBeVisible();
    await expect(
      page.locator(".order-detail__total").getByText("$3.57", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".order-detail__card")).toHaveCSS("color", "rgb(58, 44, 53)");
    await expect(page.locator(".order-detail__header")).toHaveCSS(
      "background-color",
      "rgb(225, 238, 232)",
    );
    await expect(page.locator(".order-detail__total")).toHaveCSS(
      "background-color",
      "rgb(244, 197, 91)",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText("Line total")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Orders/i })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/astro-pop\/account$/);
    await expect(page.getByRole("heading", { name: "Order History" })).toBeVisible();
  });

  test("shows the reusable rocket loader while order history is pending", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("playwright-clerk-authenticated", "true");
    });
    await page.route("**/api/astro-pop/account/session", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ authenticated: true }),
      }),
    );

    let releaseOrders: (() => void) | undefined;
    const waitingForOrders = new Promise<void>((resolve) => {
      releaseOrders = resolve;
    });
    await page.route("**/api/astro-pop/account/orders", async (route) => {
      await waitingForOrders;
      await route.fulfill({ contentType: "application/json", body: "[]" });
    });

    try {
      await page.goto("/app/astro-pop");
      await page.getByRole("link", { name: "Account" }).click({ noWaitAfter: true });
      await expect(page.getByRole("status", { name: "Fetching your orders..." })).toBeVisible();
    } finally {
      releaseOrders?.();
    }

    await expect(page.getByText("No orders in the last 30 days.")).toBeVisible();
    await expect(page.getByRole("status", { name: "Fetching your orders..." })).toHaveCount(0);
  });

  test("shows a branded text fallback if the Astro Pop hero image fails", async ({ page }) => {
    await page.route("**/astro-pop/hero/astropopman-delivers-cosmic-cheer.png", (route) =>
      route.fulfill({ status: 404, body: "Not found" }),
    );

    await page.goto("/app/astro-pop");
    await expect(page.getByRole("heading", { name: "AstroPop Soda Co." })).toBeVisible();
    await expect(
      page.locator(".astropop-hero__fallback").getByText("Bringing Tomorrow to Your Doorstep!"),
    ).toBeVisible();
    await expect(page.locator(".astropop-hero__image")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Flavors", exact: true })).toBeVisible();
  });

  test("keeps homepage section shortcuts as local anchors", async ({ page }) => {
    await page.goto("/app/astro-pop");

    // Wait until the desktop navigation has mounted.
    await expect(page.getByRole("button", { name: "Back to top" })).toBeVisible();

    const flavorsLink = page.getByRole("link", {
      name: "Flavors",
      exact: true,
    });

    await expect(flavorsLink).toHaveAttribute("href", "#astropop-flavors-title");

    await flavorsLink.click();

    await expect(page).toHaveURL(/\/app\/astro-pop#astropop-flavors-title$/);

    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();
  });

  test("takes story and flavor-detail visitors to the homepage flavors section", async ({
    page,
  }) => {
    await page.goto("/app/astro-pop/our-story");
    await page.getByRole("link", { name: "Shop Flavors" }).click();

    await expect(page).toHaveURL(/\/app\/astro-pop\/#astropop-flavors-title$/);
    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/astro-pop\/our-story$/);

    await page.goto("/app/astro-pop/flavors/atomic-cherry-fizz");
    await page.getByRole("link", { name: "Shop Flavors" }).click();

    await expect(page).toHaveURL(/\/app\/astro-pop\/#astropop-flavors-title$/);
    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();
  });

  test("takes the Our Story closing CTA to the homepage flavors section", async ({ page }) => {
    await page.goto("/app/astro-pop/our-story");

    await page.getByRole("link", { name: "Explore Our Flavors" }).click();

    await expect(page).toHaveURL(/\/app\/astro-pop\/#astropop-flavors-title$/);
    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();
  });

  test("takes Our Story footer shortcuts to homepage sections and returns to the current page top", async ({
    page,
  }) => {
    await page.goto("/app/astro-pop/our-story");
    const footer = page.getByRole("contentinfo");

    await footer.getByRole("link", { name: "Our Marvelous Flavors" }).click();
    await expect(page).toHaveURL(/\/app\/astro-pop\/#astropop-flavors-title$/);
    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/astro-pop\/our-story$/);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
    await footer.getByRole("link", { name: "Back to Top" }).click();
    await expect(page).toHaveURL(/\/app\/astro-pop\/our-story$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("supports direct flavor anchors, home links, reactive cart labels, and the mobile drawer", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "astropop-crate",
        JSON.stringify([{ flavorId: "atomic-cherry-fizz", quantity: 2 }]),
      );
    });
    await page.goto("/app/astro-pop/#astropop-flavors-title");

    await expect(page.locator("#astropop-flavors-title")).toBeInViewport();

    await page.goto("/app/astro-pop/our-story");
    await expect(page.getByRole("link", { name: "Astro Pop home" })).toHaveAttribute(
      "href",
      "/app/astro-pop",
    );
    await expect(page.getByRole("link", { name: "Cart, 2 bottles" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page
      .getByRole("dialog", { name: "AstroPop navigation menu" })
      .getByRole("link", { name: "Shop Flavors" })
      .click();

    await expect(page).toHaveURL(/\/app\/astro-pop\/#astropop-flavors-title$/);
    await expect(page.getByRole("dialog", { name: "AstroPop navigation menu" })).toHaveCount(0);
  });
});
