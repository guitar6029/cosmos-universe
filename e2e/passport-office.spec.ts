import { expect, test } from "@playwright/test";

test("keeps the Passport Office readable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/passport-office");

  await expect(page.getByRole("button", { name: "Just looking around." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("shows Stella's dialogue without loading character artwork", async ({ page }) => {
  await page.goto("/passport-office");

  await expect(page.getByText("A message from Stella Starling")).toBeVisible();
  await expect(page.locator('img[src*="/stella/"]')).toHaveCount(0);
});

test("keeps navigation auth destinations and Passport Office deep links usable on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
  await expect(navigation.getByRole("link", { name: "Sign In" })).toHaveAttribute(
    "href",
    "/passport-office?intent=sign-in",
  );
  await expect(navigation.getByRole("link", { name: "Register" })).toHaveAttribute(
    "href",
    "/passport-office?intent=register",
  );

  await page.goto("/passport-office?intent=register");
  const registration = page.getByRole("region", { name: "CosmoPort traveler registration" });
  await expect(registration).toBeVisible();
  const astronaut = registration.getByRole("radio", { name: "Astronaut" });
  await expect(astronaut).toBeChecked();
  const astronautOption = registration.locator(
    '.passport-registration__portrait-option:has(input[value="astronaut"])',
  );
  await expect(astronautOption.locator(".passport-registration__portrait-tab")).toHaveText(
    "Selected",
  );

  const robot = registration.getByRole("radio", { name: "Robot" });
  await astronaut.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(robot).toBeChecked();
  await expect(astronaut).not.toBeChecked();
  await expect(astronautOption.locator(".passport-registration__portrait-tab")).toHaveCount(0);
  const robotOption = registration.locator(
    '.passport-registration__portrait-option:has(input[value="robot"])',
  );
  await expect(robotOption.locator(".passport-registration__portrait-tab")).toHaveText("Selected");
  expect(
    await registration
      .locator(".passport-registration__portrait-options")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.goto("/passport-office?intent=sign-in");
  await expect(
    page.getByRole("region", { name: "CosmoPort returning traveler login" }),
  ).toBeVisible();
});
