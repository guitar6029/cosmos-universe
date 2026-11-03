import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClerkClient } from "@clerk/backend";

export const manifestPath = resolve("test-results/clerk-passport-created-users.json");
const passportTestAddress = /^cosmoport-passport-[a-z0-9-]+\+clerk_test@/i;
const developmentKey = /^(?:pk|sk)_test_[A-Za-z0-9_-]+$/;

export async function assertDevelopmentClerkEnvironment() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!developmentKey.test(secretKey ?? ""))
    throw new Error(
      "Refusing Clerk test-user cleanup: CLERK_SECRET_KEY must be a valid ASCII development sk_test_ key.",
    );
  if (!developmentKey.test(process.env.CLERK_PUBLISHABLE_KEY ?? ""))
    throw new Error(
      "Refusing Clerk test-user cleanup: CLERK_PUBLISHABLE_KEY must be a valid ASCII development pk_test_ key.",
    );
  const clerk = createClerkClient({ secretKey });
  const instance = await clerk.instance.get();
  if (instance.environmentType !== "development")
    throw new Error(
      "Refusing Clerk test-user cleanup: the Backend API did not confirm a development instance.",
    );
  return clerk;
}

export async function readManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return { users: [] };
    throw error;
  }
}

export async function writeManifest(manifest) {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function registerTestEmail(email) {
  if (!passportTestAddress.test(email))
    throw new Error(
      "Refusing to register an email outside the Passport Office Clerk test namespace.",
    );
  const manifest = await readManifest();
  if (!manifest.users.some((user) => user.email === email)) {
    manifest.users.push({ email, clerkUserId: null, createdAt: new Date().toISOString() });
    await writeManifest(manifest);
  }
}

export async function recordClerkUserId(email, clerkUserId) {
  const manifest = await readManifest();
  const entry = manifest.users.find((user) => user.email === email);
  if (!entry || !passportTestAddress.test(email) || !/^user_/.test(clerkUserId))
    throw new Error("Refusing to record an unregistered Clerk test user.");
  entry.clerkUserId = clerkUserId;
  await writeManifest(manifest);
}

export async function cleanupClerkTestUsers() {
  const clerk = await assertDevelopmentClerkEnvironment();
  const manifest = await readManifest();
  for (const entry of manifest.users) {
    if (!passportTestAddress.test(entry.email))
      throw new Error(
        `Refusing to clean an address outside the Passport Office Clerk test namespace: ${entry.email}`,
      );
    // A manifest entry without a recorded ID is evidence only. Never discover a
    // deletion target by email: cleanup may act solely on the exact recorded ID.
    if (!entry.clerkUserId) continue;
    const listed = await clerk.users.getUserList({ userId: [entry.clerkUserId] });
    if (listed.data.length === 0) continue;
    if (listed.data.length !== 1)
      throw new Error(`Refusing to delete an ambiguous Clerk user for ${entry.email}.`);
    const user = listed.data[0];
    const matchingEmail = user.emailAddresses.some(
      (address) => address.emailAddress.toLowerCase() === entry.email.toLowerCase(),
    );
    if (user.id !== entry.clerkUserId || !matchingEmail)
      throw new Error(`Refusing to delete an unrelated user for ${entry.email}.`);
    await clerk.users.deleteUser(user.id);
    entry.deletedAt = new Date().toISOString();
    await writeManifest(manifest);
  }
}

export async function assertRecordedClerkTestUsersDeleted() {
  const clerk = await assertDevelopmentClerkEnvironment();
  const manifest = await readManifest();
  for (const entry of manifest.users) {
    if (!entry.clerkUserId) continue;
    const listed = await clerk.users.getUserList({ userId: [entry.clerkUserId] });
    if (listed.data.length !== 0)
      throw new Error(
        `Clerk test-user cleanup did not delete the recorded user for ${entry.email}.`,
      );
  }
}
