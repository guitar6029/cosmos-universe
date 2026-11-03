// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";
import UniverseAccount from "../app/pages/account.vue";

const user = ref<{
  fullName: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  primaryEmailAddress: { emailAddress: string };
  update: ReturnType<typeof vi.fn>;
} | null>(null);

vi.stubGlobal("useUser", () => ({ isLoaded: ref(true), user }));
vi.stubGlobal("definePageMeta", vi.fn());
vi.stubGlobal("useSeoMeta", vi.fn());

const UniverseNavStub = defineComponent({ template: "<nav>Cosmos Universe</nav>" });
const renderPage = () =>
  renderToString(
    createSSRApp({ render: () => h(UniverseAccount) }).component("UniverseNav", UniverseNavStub),
  );

describe("Cosmos Universe account", () => {
  it("renders the shared profile without aggregating Astro Pop order data", async () => {
    user.value = {
      fullName: "Nova Ray",
      firstName: "Nova",
      lastName: "Ray",
      imageUrl: "https://example.test/nova.png",
      primaryEmailAddress: { emailAddress: "nova@example.test" },
      update: vi.fn(),
    };
    const html = await renderPage();
    expect(html).toContain("My Account");
    expect(html).toContain("Nova Ray");
    expect(html).toContain("nova@example.test");
    expect(html).toContain('src="https://example.test/nova.png"');
    expect(html).toContain("Save name");
    expect(html).not.toContain("Order History");
    expect(html).not.toContain("Delete account</button>");
  });

  it("does not expose profile editing while the user is unavailable", async () => {
    user.value = null;
    const html = await renderPage();
    expect(html).toContain("Loading your profile");
    expect(html).not.toContain("Save name");
  });
});
