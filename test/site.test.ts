Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
import { describe, expect, it } from "vitest";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../app/site";

describe("site metadata", () => {
  it("defines the public site identity", () => {
    expect(SITE_TITLE).toBe("CosmosUniverse");
    expect(SITE_DESCRIPTION).toContain("retrofuturistic space-travel");
    expect(SITE_URL).toBe("https://cosmos-universe.com");
  });
});
