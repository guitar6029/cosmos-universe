// @vitest-environment jsdom
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UniverseNav from "../app/components/universe/UniverseNav.vue";
import UniverseMultiverseCollage from "../app/components/universe/UniverseMultiverseCollage.vue";
import UniverseHomePage from "../app/pages/index.vue";
import UniverseAboutPage from "../app/pages/about.vue";
import UniverseBlogPage from "../app/pages/blog.vue";
import {
  GRAND_CONCOURSE_MEDIA,
  GRAND_CONCOURSE_MEDIA_BASE_URL,
} from "../app/data/grandConcourseMedia";
import { BLOG_MEDIA } from "../app/data/blogMedia";

type AccountState = "signed-in" | "signed-out" | "loading";

const signOut = vi.fn();
const adminAccess = vi.fn<() => Promise<{ authorized: boolean }>>();
const authState = ref<AccountState>("loading");
const user = ref<{
  fullName?: string;
  imageUrl?: string;
  primaryEmailAddress?: { emailAddress: string };
} | null>(null);

vi.stubGlobal("useAuth", () => ({
  isLoaded: ref(authState.value !== "loading"),
  isSignedIn: ref(authState.value === "signed-in"),
  signOut: ref(signOut),
}));
vi.stubGlobal("useUser", () => ({ user }));
vi.stubGlobal("useSeoMeta", vi.fn());
vi.stubGlobal("$fetch", adminAccess);
vi.mock("../app/composables/useCosmosProfile", () => ({
  useCosmosProfile: () => ({
    avatarSrc: ref("https://media.cosmos-universe.com/avatars/cosmos_avatar_robot_transparent.png"),
    loading: ref(false),
  }),
}));
vi.stubGlobal("useFetch", () => ({
  data: ref({
    apps: [
      {
        id: "astro-pop",
        title: "Astro Pop Soda Co.",
        description: "Your neighborhood soda shop, now serving the stars.",
        enabled: true,
      },
      {
        id: "cosmoport-voyage",
        title: "CosmoPort Voyage",
        description: "Our next departure is still under construction.",
        enabled: false,
      },
    ],
  }),
  status: ref("success"),
  error: ref(null),
  refresh: vi.fn(),
}));

const mountSignedInNavigation = () => {
  authState.value = "signed-in";
  user.value = {
    fullName: "Nova Ray",
    imageUrl: "https://example.test/nova.png",
    primaryEmailAddress: { emailAddress: "nova@example.test" },
  };
  const container = document.createElement("div");
  const app = createApp(UniverseNav);

  app.component("NuxtLink", NuxtLink);
  document.body.appendChild(container);
  app.mount(container);

  return { app, container };
};

const flushSignOut = async () => {
  await Promise.resolve();
  await nextTick();
};

const flushAdminAccess = async () => {
  await Promise.resolve();
  await nextTick();
};

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: props.to }, slots.default?.()),
});

const renderWithAccountState = (
  component:
    | typeof UniverseNav
    | typeof UniverseHomePage
    | typeof UniverseAboutPage
    | typeof UniverseBlogPage,
  accountState: AccountState,
) => {
  authState.value = accountState;
  user.value =
    accountState === "signed-in"
      ? {
          fullName: "Nova Ray",
          imageUrl: "https://example.test/nova.png",
          primaryEmailAddress: { emailAddress: "nova@example.test" },
        }
      : null;
  const app = createSSRApp({ render: () => h(component) });
  app.component("NuxtLink", NuxtLink);
  app.component("UniverseNav", UniverseNav);
  app.component("UniverseMultiverseCollage", UniverseMultiverseCollage);
  return renderToString(app);
};

describe("CosmoPort Universe navigation", () => {
  beforeEach(() => {
    adminAccess.mockResolvedValue({ authorized: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.replaceChildren();
  });
  it("links signed-out visitors directly to the custom sign-in and registration flows", async () => {
    const html = await renderWithAccountState(UniverseNav, "signed-out");

    expect(html).toContain('aria-label="CosmoPort Universe"');
    expect(html).toContain(">Home<");
    expect(html).toContain("Sign In");
    expect(html).toContain("Register");
    expect(html).toContain('href="/passport-office?intent=sign-in"');
    expect(html).toContain('href="/passport-office?intent=register"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/blog"');
    expect(html).not.toContain("UserButton");
  });

  it("shows the saved Cosmos avatar in the Account control", async () => {
    const html = await renderWithAccountState(UniverseNav, "signed-in");

    expect(html).toContain("cosmos_avatar_robot_transparent.png");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('aria-haspopup="menu"');
    expect(html).toContain("Account");
    expect(html).not.toContain("Sign Out");
    expect(html).not.toContain("Sign In");
    expect(html).not.toContain("Register");
  });

  it("uses a compact avatar-only trigger with a chevron and accessible name", async () => {
    const html = await renderWithAccountState(UniverseNav, "signed-in");
    expect(html).toContain('aria-label="Account for Nova Ray"');
    expect(html).toContain("universe-nav__chevron");
    expect(html).not.toContain("<span>Account</span>");
    const styles = await readFile(
      resolve(process.cwd(), "app/components/universe/UniverseNav.css"),
      "utf8",
    );
    const avatarStyles = await readFile(
      resolve(process.cwd(), "app/components/shared/UniverseAvatar.vue"),
      "utf8",
    );
    expect(avatarStyles).toContain("border-radius: 0.5rem");
    expect(styles).toContain("width: min(14.5rem, calc(100vw - 1rem))");
  });

  it("shows future destinations without linking to unfinished routes", async () => {
    const { app, container } = mountSignedInNavigation();
    container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle")?.click();
    await nextTick();
    const menu = container.querySelector('[role="group"]');
    expect(menu?.textContent).toContain("Account");
    expect(menu?.textContent).toContain("Settings");
    expect(menu?.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1);
    expect(menu?.querySelector('a[href="/account"]')?.textContent).toContain("My Account");
    expect(container.querySelector(".universe-nav__chevron--open")).not.toBeNull();
    app.unmount();
  });

  it("shows an authorized Super Admin a keyboard-accessible Admin Dashboard link", async () => {
    adminAccess.mockResolvedValueOnce({ authorized: true });
    const { app, container } = mountSignedInNavigation();
    await flushAdminAccess();

    container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle")?.click();
    await nextTick();

    const missionControl = container.querySelector<HTMLAnchorElement>('a[href="/admin"]');
    expect(adminAccess).toHaveBeenCalledWith("/api/admin/access");
    expect(missionControl?.textContent).toContain("Admin Dashboard");
    expect(missionControl?.classList).toContain("universe-nav__menu-link");
    expect(missionControl?.getAttribute("tabindex")).toBeNull();
    missionControl?.focus();
    expect(document.activeElement).toBe(missionControl);
    app.unmount();
  });

  it("keeps Admin Dashboard hidden from regular authenticated users", async () => {
    const { app, container } = mountSignedInNavigation();
    await flushAdminAccess();

    container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle")?.click();
    await nextTick();

    expect(adminAccess).toHaveBeenCalledWith("/api/admin/access");
    expect(container.querySelector('a[href="/admin"]')).toBeNull();
    app.unmount();
  });

  it("does not request or show Admin Dashboard for signed-out visitors", async () => {
    authState.value = "signed-out";
    user.value = null;
    const container = document.createElement("div");
    const app = createApp(UniverseNav);
    app.component("NuxtLink", NuxtLink);
    document.body.appendChild(container);
    app.mount(container);
    await flushAdminAccess();

    expect(adminAccess).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain("Admin Dashboard");
    app.unmount();
  });

  it("keeps Admin Dashboard hidden when authorization fails", async () => {
    adminAccess.mockRejectedValueOnce(new Error("Authorization unavailable"));
    const { app, container } = mountSignedInNavigation();
    await flushAdminAccess();

    container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle")?.click();
    await nextTick();

    expect(container.querySelector('a[href="/admin"]')).toBeNull();
    app.unmount();
  });

  it("dismisses the dropdown on outside pointer interaction and focus departure", async () => {
    const { app, container } = mountSignedInNavigation();
    const trigger = container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle");
    trigger?.click();
    await nextTick();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await nextTick();
    expect(container.querySelector('[role="group"]')).toBeNull();

    trigger?.click();
    await nextTick();
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    await nextTick();
    expect(container.querySelector('[role="group"]')).toBeNull();
    expect(document.activeElement).toBe(outside);
    app.unmount();
  });

  it("uses the saved avatar when Clerk has no image", async () => {
    authState.value = "signed-in";
    user.value = { fullName: "Nova Ray" };
    const app = createSSRApp({ render: () => h(UniverseNav) });
    app.component("NuxtLink", NuxtLink);
    const html = await renderToString(app);

    expect(html).toContain("cosmos_avatar_robot_transparent.png");
    expect(html).not.toContain("universe-avatar__initials");
  });

  it("opens an Account menu with identity details and requests a Clerk sign-out to the Universe root", async () => {
    signOut.mockResolvedValue(undefined);
    const { app, container } = mountSignedInNavigation();
    const accountButton = container.querySelector<HTMLButtonElement>(
      ".universe-nav__account-toggle",
    );
    accountButton?.click();
    await nextTick();
    expect(container.querySelector('[role="group"]')?.textContent).toContain("Nova Ray");
    expect(container.querySelector('[role="group"]')?.textContent).toContain("nova@example.test");
    const button = container.querySelector<HTMLButtonElement>(".universe-nav__menu-sign-out");

    button?.click();
    await flushSignOut();

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: "/" });
    expect(button?.disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')).toBeNull();

    app.unmount();
  });

  it("shows a safe error after sign-out fails, resets loading, and permits a retry", async () => {
    let rejectSignOut: (reason?: unknown) => void = () => undefined;
    signOut.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSignOut = reject;
        }),
    );
    signOut.mockResolvedValueOnce(undefined);
    const { app, container } = mountSignedInNavigation();
    container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle")?.click();
    await nextTick();
    const button = container.querySelector<HTMLButtonElement>(".universe-nav__menu-sign-out");

    button?.click();
    button?.click();
    await nextTick();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain("Signing Out");

    rejectSignOut(new Error("Sensitive provider failure"));
    await flushSignOut();

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("We couldn't sign you out. Please try again.");
    expect(alert?.textContent).not.toContain("Sensitive provider failure");
    expect(button?.disabled).toBe(false);
    expect(button?.textContent).toContain("Sign Out");

    button?.click();
    await flushSignOut();
    expect(signOut).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[role="alert"]')).toBeNull();

    app.unmount();
  });

  it("keeps account controls pending until Clerk finishes loading", async () => {
    const html = await renderWithAccountState(UniverseNav, "loading");

    expect(html).toContain("Loading account controls");
    expect(html).not.toContain("Sign In");
    expect(html).not.toContain("Register");
    expect(html).not.toContain("Avatar");
  });

  it("closes the Account menu with Escape", async () => {
    const { app, container } = mountSignedInNavigation();
    const button = container.querySelector<HTMLButtonElement>(".universe-nav__account-toggle");
    button?.click();
    await nextTick();
    expect(container.querySelector('[role="group"]')).not.toBeNull();
    expect(document.activeElement).toBe(
      container.querySelector<HTMLButtonElement>(".universe-nav__menu-sign-out"),
    );
    container
      .querySelector<HTMLButtonElement>(".universe-nav__menu-sign-out")
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(container.querySelector('[role="group"]')).toBeNull();
    expect(document.activeElement).toBe(button);
    app.unmount();
  });

  it("renders the Grand Concourse root with AstroPop available and Voyage unavailable", async () => {
    const html = await renderWithAccountState(UniverseHomePage, "signed-out");

    expect(html).toContain('aria-label="CosmoPort Universe"');
    expect(html).toContain("Explore the Concourse");
    expect(html).toContain("Your neighborhood soda shop, now serving the stars.");
    expect(html).toContain("Enter Astro Pop Soda Co.");
    expect(html).toContain('href="/app/astro-pop"');
    expect(html).toContain("CosmoPort Voyage");
    expect(html).toContain("Under Construction");
    expect(html).not.toContain('href="/app/cosmoport-voyage"');
    expect(html).toContain('href="/passport-office?intent=sign-in"');
    expect(html).toContain('href="/passport-office?intent=register"');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/blog"');
  });

  it("uses the reviewed Grand Concourse CDN artwork with a motion-safe fallback", async () => {
    const source = await readFile(resolve(process.cwd(), "app/pages/index.vue"), "utf8");

    expect(GRAND_CONCOURSE_MEDIA_BASE_URL).toBe(
      "https://media.cosmos-universe.com/grand-concourse",
    );
    expect(GRAND_CONCOURSE_MEDIA.hero).toBe(
      `${GRAND_CONCOURSE_MEDIA_BASE_URL}/cosmoport-grand-concourse.png`,
    );
    expect(source).toContain("GRAND_CONCOURSE_MEDIA.hero");
    expect(source).toContain("heroFailed = ref(false)");
    expect(source).toContain("heroImage.value?.complete && heroImage.value.naturalWidth === 0");
    expect(source).toContain("heroImage.value?.decode().catch");
    expect(source).toContain('@error="heroFailed = true"');
    const styles = await readFile(resolve(process.cwd(), "app/pages/index.css"), "utf8");
    expect(styles).toContain("object-fit: contain");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("renders the Universe About page with its destinations, engineering story, and home CTA", async () => {
    const html = await renderWithAccountState(UniverseAboutPage, "signed-out");

    expect(html).toContain("One Universe.");
    expect(html).toContain("Endless Possibilities.");
    expect(html).toContain("Astro Pop");
    expect(html).toContain('href="/app/astro-pop"');
    expect(html).toContain("In development");
    expect(html).toContain("The Engineering");
    expect(html).toContain("Cloudflare");
    expect(html).toContain("Built with curiosity.");
    expect(html).toContain('href="/"');
    expect(html.match(/<img/g)).toHaveLength(6);
  });

  it("renders the Universe Chronicle hero with shared navigation and an accessible fallback", async () => {
    const html = await renderWithAccountState(UniverseBlogPage, "signed-out");

    expect(html).toContain("The Universe Chronicle");
    expect(html).toContain("Engineering logs, cosmic dispatches, and stories from tomorrow.");
    expect(html).toContain(BLOG_MEDIA.universeChronicleTerminal);
    expect(html).toContain('fetchpriority="high"');
    expect(html).toContain('href="/blog"');

    const source = await readFile(resolve(process.cwd(), "app/pages/blog.vue"), "utf8");
    const styles = await readFile(resolve(process.cwd(), "app/pages/blog.css"), "utf8");
    expect(source).toContain('@error="heroFailed = true"');
    expect(source).toContain("heroImage.value?.decode().catch");
    expect(styles).toContain("object-fit: cover");
    expect(styles).toContain("min-height: 100svh");
  });

  it("is integrated only by the Universe root page", async () => {
    const [rootPage, appShell, astroPopPage, voyagePage] = await Promise.all([
      readFile(resolve(process.cwd(), "app/pages/index.vue"), "utf8"),
      readFile(resolve(process.cwd(), "app/app.vue"), "utf8"),
      readFile(resolve(process.cwd(), "app/pages/app/astro-pop/index.vue"), "utf8"),
      readFile(resolve(process.cwd(), "app/pages/app/cosmoport-voyage/index.vue"), "utf8"),
    ]);

    expect(rootPage).toContain("<UniverseNav />");
    expect(appShell).not.toContain("UniverseNav");
    expect(astroPopPage).not.toContain("UniverseNav");
    expect(voyagePage).not.toContain("UniverseNav");
  });

  it("uses Clerk composables and an SDK sign-out redirect without prebuilt Clerk UI", async () => {
    const source = await readFile(
      resolve(process.cwd(), "app/components/universe/UniverseNav.vue"),
      "utf8",
    );

    expect(source).toContain("useAuth()");
    expect(source).toContain("useUser()");
    expect(source).toContain('signOut.value({ redirectUrl: "/" })');
    expect(source).toContain('to="/passport-office?intent=sign-in"');
    expect(source).toContain('to="/passport-office?intent=register"');
    expect(source).toContain(':aria-expanded="accountMenuOpen"');
    expect(source).toContain('role="group"');
    expect(source).toContain('aria-label="Account details"');
    expect(source).not.toContain('aria-haspopup="menu"');
    expect(source).toContain('to="/account"');
    expect(source).not.toContain("SignInButton");
    expect(source).not.toContain("SignUpButton");
    expect(source).not.toContain("UserButton");
  });
});
