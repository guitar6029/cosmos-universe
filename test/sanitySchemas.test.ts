import { describe, expect, it } from "vitest";

import { schemaTypes } from "../studio/schemaTypes";

const schemaByName = new Map(schemaTypes.map((schema) => [schema.name, schema]));

function fieldsByName(schemaName: string) {
  const schema = schemaByName.get(schemaName);

  if (!schema) {
    throw new Error(`Expected the ${schemaName} schema to be registered.`);
  }

  return new Map(schema.fields.map((field) => [field.name, field]));
}

describe("Sanity content schemas", () => {
  it("registers the existing destination schema with blog and author schemas", () => {
    expect(schemaTypes.map((schema) => schema.name)).toEqual(["destination", "author", "blogPost"]);
  });

  it("defines optional author images and editorial identity fields", () => {
    const fields = fieldsByName("author");
    const avatar = fields.get("avatar");

    expect(fields.get("name")?.type).toBe("string");
    expect(fields.get("slug")?.options?.source).toBe("name");
    expect(avatar?.type).toBe("image");
    expect(avatar?.options?.hotspot).toBe(true);
    expect(avatar?.validation).toBeUndefined();
    expect(fields.get("isFictional")?.initialValue).toBe(false);
  });

  it("uses the author document type and expected categories for blog posts", () => {
    const fields = fieldsByName("blogPost");
    const author = fields.get("author");
    const categories = fields.get("category")?.options?.list;

    expect(author?.type).toBe("reference");
    expect(author?.to).toEqual([{ type: "author" }]);
    expect(categories).toEqual([
      { title: "Engineering Logs", value: "engineering" },
      { title: "Debugging Dispatches", value: "debugging" },
      { title: "Universe Updates", value: "updates" },
      { title: "Universe Lore", value: "lore" },
    ]);
    expect(fields.get("coverImage")?.validation).toBeUndefined();
    expect(fields.get("coverImage")?.options?.hotspot).toBe(true);
  });

  it("supports the expected Portable Text structures", () => {
    const body = fieldsByName("blogPost").get("body");
    const block = body?.of?.find((member) => member.type === "block");
    const image = body?.of?.find((member) => member.name === "image");
    const code = body?.of?.find((member) => member.name === "code");

    expect(block?.styles).toEqual([
      { title: "Normal", value: "normal" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
    ]);
    expect(block?.lists).toEqual([
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ]);
    expect(block?.marks?.decorators).toEqual([
      { title: "Bold", value: "strong" },
      { title: "Italic", value: "em" },
    ]);
    expect(block?.marks?.annotations?.[0]?.name).toBe("link");
    expect(image?.type).toBe("image");
    expect(image?.fields?.[0]?.name).toBe("alt");
    expect(code?.fields?.map((field) => field.name)).toEqual(["code", "language"]);
  });
});
