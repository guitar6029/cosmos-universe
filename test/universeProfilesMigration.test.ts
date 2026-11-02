import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "database/migrations/202611020001_create_universe_profiles.sql"),
  "utf8",
);

describe("universal profile schema migration", () => {
  it("creates an atomic, additive table with independent profile identity", () => {
    expect(migration).toMatch(/BEGIN\s*;/i);
    expect(migration).toMatch(/CREATE TABLE public\.profiles\s*\(/i);
    expect(migration).toMatch(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/i);
    expect(migration).toMatch(/user_id TEXT NOT NULL UNIQUE/i);
    expect(migration).toMatch(/COMMIT\s*;/i);
    expect(migration).not.toMatch(/DROP TABLE|ALTER TABLE public\.apps|ALTER TABLE public\.orders/i);
  });

  it("defaults to a reviewed astronaut avatar and limits persisted values to four presets", () => {
    expect(migration).toMatch(/avatar_id TEXT NOT NULL DEFAULT 'astronaut'/i);
    expect(migration).toMatch(/CHECK\s*\(\s*avatar_id IN\s*\(\s*'astronaut',\s*'cat',\s*'alien',\s*'robot'\s*\)\s*\)/i);
    expect(migration).toMatch(/created_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/i);
    expect(migration).toMatch(/updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/i);
  });
});
