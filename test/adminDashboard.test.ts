import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout from "../app/layouts/admin.vue";
import AdminDashboardPage from "../app/pages/admin.vue";

const pageMeta = vi.fn();
const fetchMock = vi.fn();
vi.stubGlobal("definePageMeta", pageMeta);
vi.stubGlobal("useFetch", fetchMock);

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: props.to }, slots.default?.()),
});

async function renderDashboard() {
  const app = createSSRApp({
    render: () => h(AdminLayout, null, { default: () => h(AdminDashboardPage) }),
  });
  app.component("NuxtLink", NuxtLink);
  return renderToString(app);
}

describe("Admin Dashboard", () => {
  beforeEach(() => {
    pageMeta.mockClear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      data: ref({
        apps: [{ id: "astro-pop", title: "Astro Pop", description: "Soda", enabled: true }],
      }),
      status: ref("success"),
      error: ref(null),
      refresh: vi.fn(),
    });
  });

  it("registers the protected layout and middleware", async () => {
    await renderDashboard();
    expect(pageMeta).toHaveBeenCalledWith({ layout: "admin", middleware: "admin" });
  });

  it("renders an app and its toggle inside the sidebar layout", async () => {
    const html = await renderDashboard();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/apps");
    expect(html).toContain('aria-label="Admin navigation"');
    expect(html).toContain('id="admin-dashboard-title"');
    expect(html).toContain("Astro Pop");
    expect(html).toContain("Soda");
    expect(html).toContain("Public availability for Astro Pop");
    expect(html).toContain("Public availability");
    expect(html).toContain("On");
  });

  it("shows the empty state only after a successful empty request", async () => {
    fetchMock.mockResolvedValueOnce({
      data: ref({ apps: [] }),
      status: ref("success"),
      error: ref(null),
      refresh: vi.fn(),
    });
    expect(await renderDashboard()).toContain("No applications registered yet.");
  });

  it("shows an error instead of claiming no apps exist when fetching fails", async () => {
    fetchMock.mockResolvedValueOnce({
      data: ref(null),
      status: ref("error"),
      error: ref(new Error("Failed")),
      refresh: vi.fn(),
    });
    const html = await renderDashboard();
    expect(html).toContain("Unable to load applications");
    expect(html).not.toContain("No applications registered yet");
  });

  it("uses a centered sidebar and responsive layout", async () => {
    const source = await readFile(resolve(process.cwd(), "app/layouts/admin.vue"), "utf8");
    expect(source).toContain("justify-content: center");
    expect(source).toContain("@media (max-width: 640px)");
    expect(source).toContain(":focus-visible");
  });

  it("wraps the page in NuxtLayout in the app shell", async () => {
    const source = await readFile(resolve(process.cwd(), "app/app.vue"), "utf8");
    expect(source).toMatch(/<NuxtLayout>[\s\S]*<NuxtPage\s*\/>[\s\S]*<\/NuxtLayout>/);
  });
});
