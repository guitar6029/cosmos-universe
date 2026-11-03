import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CosmoportCoreConfigurationError,
  getCosmoportApps,
  getCosmoportCoreDatabaseHealth,
  updateCosmoportAppStatus,
} from "../server/utils/cosmoportCoreDatabase";

const neonMock = vi.hoisted(() => vi.fn());
vi.mock("@neondatabase/serverless", () => ({ neon: neonMock }));

const url = "postgresql://test.example/cosmoport_core";
const astro = {
  id: "astro-pop", title: "Astro Pop Soda Co.",
  description: "Soda shop", enabled: true,
};

describe("CosmoPort Core database", () => {
  beforeEach(() => { neonMock.mockReset(); vi.unstubAllEnvs(); });

  it("checks database connectivity without writing", async () => {
    const sql = vi.fn().mockResolvedValue([{ connected: 1 }]);
    neonMock.mockReturnValue(sql);
    await expect(getCosmoportCoreDatabaseHealth(url)).resolves.toEqual({ status: "ok" });
    expect(sql.mock.calls[0]?.[0].raw).toEqual(["SELECT 1 AS connected"]);
  });

  it("fails closed when the pooled connection is missing", async () => {
    await expect(getCosmoportApps("")).rejects.toBeInstanceOf(CosmoportCoreConfigurationError);
    await expect(updateCosmoportAppStatus("astro-pop", false, "")).rejects.toBeInstanceOf(CosmoportCoreConfigurationError);
    expect(neonMock).not.toHaveBeenCalled();
  });

  it("lists apps with a deterministic ordering", async () => {
    const sql = vi.fn().mockResolvedValue([astro]);
    neonMock.mockReturnValue(sql);
    await expect(getCosmoportApps(url)).resolves.toEqual([astro]);
    expect(neonMock).toHaveBeenCalledWith(url);
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toMatch(/FROM public\.apps\s+ORDER BY title ASC/);
  });

  it("updates only the requested app using SQL parameters, returning the saved record", async () => {
    const sql = vi.fn().mockResolvedValue([{ ...astro, enabled: false }]);
    neonMock.mockReturnValue(sql);
    await expect(updateCosmoportAppStatus("astro-pop", false, url)).resolves.toEqual({ ...astro, enabled: false });
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("UPDATE public.apps");
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("RETURNING id, title, description, enabled");
    expect(sql.mock.calls[0]?.slice(1)).toEqual([false, "astro-pop"]);
  });

  it("returns null if no row matches the id", async () => {
    neonMock.mockReturnValue(vi.fn().mockResolvedValue([]));
    await expect(updateCosmoportAppStatus("missing-app", true, url)).resolves.toBeNull();
  });

  it("propagates connection failures", async () => {
    const failure = new Error("Database unavailable");
    neonMock.mockReturnValue(vi.fn().mockRejectedValue(failure));
    await expect(getCosmoportApps(url)).rejects.toBe(failure);
  });
});
