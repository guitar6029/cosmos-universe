import { beforeEach, describe, expect, it, vi } from "vitest";

const neonMock = vi.hoisted(() => vi.fn());

vi.mock("@neondatabase/serverless", () => ({
  neon: neonMock,
}));

import { createCosmosProfile } from "../server/utils/cosmoportCoreDatabase";

describe("createCosmosProfile", () => {
  beforeEach(() => {
    neonMock.mockReset();
  });

  it("returns created after inserting a new profile", async () => {
    const sql = vi.fn().mockResolvedValue([{ id: "profile_test_123" }]);
    neonMock.mockReturnValue(sql);

    await expect(
      createCosmosProfile("user_test_123", "postgresql://test.example/cosmos"),
    ).resolves.toEqual({ status: "created" });

    expect(neonMock).toHaveBeenCalledWith("postgresql://test.example/cosmos");
  });

  it("returns already_exists when the idempotent insert affects no rows", async () => {
    neonMock.mockReturnValue(vi.fn().mockResolvedValue([]));

    await expect(
      createCosmosProfile("user_existing", "postgresql://test.example/cosmos"),
    ).resolves.toEqual({ status: "already_exists" });
  });

  it("uses a parameterized user ID and an idempotent conflict clause", async () => {
    const sql = vi.fn().mockResolvedValue([{ id: "profile_test_123" }]);
    neonMock.mockReturnValue(sql);

    await createCosmosProfile("user_parameterized", "postgresql://test.example/cosmos");

    expect(sql).toHaveBeenCalledOnce();
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain(
      "ON CONFLICT (user_id) DO NOTHING",
    );
    expect(sql.mock.calls[0]?.slice(1)).toEqual(["user_parameterized"]);
  });

  it("propagates database errors", async () => {
    const databaseError = new Error("connection refused");
    neonMock.mockReturnValue(vi.fn().mockRejectedValue(databaseError));

    await expect(
      createCosmosProfile("user_database_failure", "postgresql://test.example/cosmos"),
    ).rejects.toBe(databaseError);
  });
});
