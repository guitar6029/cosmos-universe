import { describe, expect, it } from "vitest";
import { searchArticlesTool } from "../../../server/ai/experiments/archivist/tools";

describe("search_articles tool", () => {
  it("finds relevant articles", () => {
    const results = searchArticlesTool.execute({
      query: "Voyage",
    });

    expect(results.length).toBeGreaterThan(0);
  });

  it("rejects empty queries", () => {
    expect(() => searchArticlesTool.execute({ query: "" })).toThrow();
  });

  it("rejects invalid argument types", () => {
    expect(() => searchArticlesTool.execute({ query: 123 })).toThrow();
  });

  it("rejects queries exceeding the limit", () => {
    expect(() => searchArticlesTool.execute({ query: "x".repeat(121) })).toThrow();
  });
});
