import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), routeParam: vi.fn() }));

vi.mock("h3", () => ({
  createError: (details: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(details.statusMessage), details),
  defineEventHandler: <T>(handler: T) => handler,
  getRouterParam: (...args: unknown[]) => mocks.routeParam(...args),
}));

type ArticleHandler = (event: object) => Promise<unknown>;

describe("Chronicle article endpoint", () => {
  let handler: ArticleHandler;

  beforeAll(async () => {
    vi.stubGlobal("useSanity", () => ({ fetch: mocks.fetch }));
    handler = (await import("../server/api/blog/[slug].get")).default as ArticleHandler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.routeParam.mockReturnValue("the-case-of-the-mysterious-three-lines");
  });

  it("returns a projected published article", async () => {
    const article = { slug: "the-case-of-the-mysterious-three-lines", title: "A dispatch" };
    mocks.fetch.mockResolvedValue(article);

    await expect(handler({})).resolves.toEqual(article);
    expect(mocks.fetch).toHaveBeenCalledWith(expect.any(String), {
      slug: "the-case-of-the-mysterious-three-lines",
    });
  });

  it("returns 404 for a missing or unpublished article", async () => {
    mocks.fetch.mockResolvedValue(null);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns 404 when no slug is supplied", async () => {
    mocks.routeParam.mockReturnValue(undefined);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("does not expose Sanity failures", async () => {
    mocks.fetch.mockRejectedValue(new Error("private Sanity configuration"));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: "The Chronicle dispatch is temporarily unavailable.",
    });
  });
});
