import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { recordClerkUserId, registerTestEmail } from "../../scripts/clerk-test-users.mjs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
let testEmail: string | undefined;

test.afterEach(async () => {
  if (!testEmail) return;
  const email = testEmail;

  const users = await clerk.users.getUserList({ emailAddress: [email] });
  const matchingUsers = users.data.filter((user) =>
    user.emailAddresses.some(
      (address) => address.emailAddress.toLowerCase() === email.toLowerCase(),
    ),
  );
  if (matchingUsers.length > 1) throw new Error("Refusing to record an ambiguous Clerk test user.");
  if (matchingUsers[0]) await recordClerkUserId(email, matchingUsers[0].id);
});

test("files a corrected Passport Office application and activates its session", async ({
  page,
}) => {
  const email = `cosmoport-passport-${Date.now()}-${Math.random().toString(36).slice(2)}+clerk_test@example.com`;
  testEmail = email;
  await registerTestEmail(email);
  await setupClerkTestingToken({ page });
  await page.goto("/passport-office");
  const applyButton = page.getByRole("button", { name: "I'd like to apply for a passport!" });
  await expect(applyButton).toBeEnabled();
  await applyButton.click();

  const registration = page.getByRole("region", { name: "CosmoPort traveler registration" });
  await expect(registration).toBeVisible();
  await expect(registration.getByRole("heading", { name: "Traveler registration" })).toBeVisible();
  await expect(registration.getByLabel("Given Name (First Name)")).toBeVisible();

  await registration.getByLabel("Given Name (First Name)").fill("Nova");
  await registration.getByLabel("Family Name (Last Name)").fill("Voyager");
  await registration.getByLabel("Contact Signal (Email Address)").fill(email);
  await registration.getByLabel("Secure Launch Phrase (Password)").fill("Passw0rd!ForClerk");
  await page.getByRole("button", { name: "Review application" }).click();
  await expect(page.getByText("Nova Voyager")).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("Passw0rd!ForClerk")).toHaveCount(0);

  await page.getByRole("button", { name: "Make corrections" }).click();
  await page.getByLabel("Family Name (Last Name)").fill("Starling");
  await page.getByRole("button", { name: "Review application" }).click();
  await page.getByRole("button", { name: "File application" }).click();
  await page.getByLabel("Verification code").fill("424242");
  await page.getByRole("button", { name: "Verify email and activate" }).click();
  await expect(page.getByText("Stella has filed your traveler registration.")).toBeVisible({
    timeout: 30_000,
  });

  const users = await clerk.users.getUserList({ emailAddress: [email] });
  expect(users.data).toHaveLength(1);
  const user = users.data[0];
  await recordClerkUserId(email, user.id);
  expect(user.firstName).toBe("Nova");
  expect(user.lastName).toBe("Starling");
  expect(user.emailAddresses.some((address) => address.emailAddress === email)).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        userId: window.Clerk?.user?.id,
        sessionId: window.Clerk?.session?.id,
      })),
    )
    .toMatchObject({ userId: user.id });
});
