import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { recordClerkUserId, registerTestEmail } from "../../scripts/clerk-test-users.mjs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const password = "Passw0rd!ForClerk";
let testEmail: string | undefined;

test.afterEach(async () => {
  if (!testEmail) return;
  const users = await clerk.users.getUserList({ emailAddress: [testEmail] });
  const matchingUsers = users.data.filter((user) =>
    user.emailAddresses.some(
      (address) => address.emailAddress.toLowerCase() === testEmail?.toLowerCase(),
    ),
  );
  if (matchingUsers.length > 1) throw new Error("Refusing to record an ambiguous Clerk test user.");
  if (matchingUsers[0]) await recordClerkUserId(testEmail, matchingUsers[0].id);
});

test("checks in a recorded development traveler through the custom login UI", async ({ page }) => {
  const email = `cosmoport-passport-${Date.now()}-${Math.random().toString(36).slice(2)}+clerk_test@example.com`;
  testEmail = email;
  await registerTestEmail(email);
  const user = await clerk.users.createUser({
    emailAddress: [email],
    password,
    firstName: "Returning",
    lastName: "Traveler",
  });
  await recordClerkUserId(email, user.id);

  await setupClerkTestingToken({ page });
  await page.goto("/passport-office");
  const returningButton = page.getByRole("button", { name: "I'm a returning traveler." });
  await expect(returningButton).toBeEnabled();
  await returningButton.click();

  const login = page.getByRole("region", { name: "CosmoPort returning traveler login" });
  await expect(login.getByRole("heading", { name: "Returning Traveler Check-In" })).toBeVisible();
  await login.getByLabel("Contact Signal (Email Address)").fill(email);
  await login.getByLabel("Secure Launch Phrase (Password)").fill(password);
  await login.getByRole("button", { name: "Present Credentials" }).click();

  const verificationCode = login.getByLabel("Verification code");
  if (
    await verificationCode
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false)
  ) {
    await verificationCode.fill("424242");
    await login.getByRole("button", { name: "Verify identity and activate" }).click();
  }

  await expect(page).toHaveURL("/");
  await page.setViewportSize({ width: 320, height: 900 });
  const universeNavigation = page.getByRole("navigation", { name: "CosmoPort Universe" });
  const accountControl = universeNavigation.getByRole("button", {
    name: /Account for Returning Traveler/,
  });
  await expect(accountControl).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect
    .poll(() =>
      page.evaluate(() => ({
        userId: window.Clerk?.user?.id,
        sessionId: window.Clerk?.session?.id,
      })),
    )
    .toMatchObject({ userId: user.id });

  await accountControl.focus();
  await page.keyboard.press("Enter");
  const accountMenu = page.getByRole("group", { name: "Account details" });
  await expect(accountMenu).toContainText("Returning Traveler");
  await expect(accountMenu).toContainText(email);
  await page.keyboard.press("Escape");
  await expect(accountMenu).toHaveCount(0);
  await expect(accountControl).toBeFocused();

  await accountControl.click();
  await accountMenu.getByRole("button", { name: "Sign Out" }).click();
  await expect(universeNavigation.getByRole("link", { name: "Sign In" })).toBeVisible();
});
