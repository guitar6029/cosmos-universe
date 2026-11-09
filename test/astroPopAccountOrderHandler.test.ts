import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  order: vi.fn(),
  routeParam: vi.fn(),
}));

vi.mock("h3", () => ({
  defineEventHandler: <T>(handler: T) => handler,
  createError: ({
    status,
    statusCode,
    statusMessage,
    statusText,
  }: {
    status?: number;
    statusCode?: number;
    statusMessage?: string;
    statusText?: string;
  }) => Object.assign(new Error(statusMessage ?? statusText), { statusCode: statusCode ?? status }),
  getRouterParam: (...args: unknown[]) => mocks.routeParam(...args),
  setResponseHeader: (event: { res: { headers: Headers } }, name: string, value: string) =>
    event.res.headers.set(name, value),
}));
vi.mock("../server/utils/getClerkAuth", () => ({ getClerkAuth: mocks.auth }));
vi.mock("../server/utils/astroPopDatabase", () => ({
  getAstroPopOrderByIdForUser: mocks.order,
}));

type Event = { res: { headers: Headers }; context: Record<string, unknown> };
type Handler = (event: Event) => Promise<unknown>;
const orderId = "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab";

describe("Astro Pop account order detail endpoint", () => {
  let handler: Handler;

  beforeAll(async () => {
    handler = (await import("../server/api/astro-pop/account/orders/[id].get")).default as Handler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockReturnValue({ isAuthenticated: false, userId: null });
    mocks.routeParam.mockReturnValue(orderId);
    mocks.order.mockResolvedValue(null);
  });

  const event = (): Event => ({ res: { headers: new Headers() }, context: {} });

  it("returns the safe persisted order details for its owner", async () => {
    const detail = {
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
          quantity: 2,
          unitPriceCents: 119,
        },
        {
          flavorId: "lunar-lime-lift",
          flavorName: "Lunar Lime Lift",
          quantity: 1,
          unitPriceCents: 119,
        },
      ],
    };
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_owner" });
    mocks.order.mockResolvedValue(detail);

    const request = event();
    await expect(handler(request)).resolves.toEqual(detail);
    expect(mocks.order).toHaveBeenCalledWith(orderId, "user_owner");
    expect(request.res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("rejects unauthenticated requests before looking up an order", async () => {
    await expect(handler(event())).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.order).not.toHaveBeenCalled();
  });

  it("hides orders that belong to another customer behind the same 404", async () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_other" });
    await expect(handler(event())).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.order).toHaveBeenCalledWith(orderId, "user_other");
  });

  it("returns 404 for missing and malformed order IDs without querying the database", async () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_owner" });
    mocks.routeParam.mockReturnValue("not-an-order-id");
    await expect(handler(event())).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.order).not.toHaveBeenCalled();

    mocks.routeParam.mockReturnValue(undefined);
    await expect(handler(event())).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.order).not.toHaveBeenCalled();
  });
});
