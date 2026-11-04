import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schemaTypesDirectory = resolve(process.cwd(), "studio/schemaTypes");

async function readSchema(name: string) {
  return readFile(resolve(schemaTypesDirectory, name), "utf8");
}

describe("Sanity content schemas", () => {
  it("registers the existing destination schema with blog and author schemas", async () => {
    const schemaIndex = await readSchema("index.ts");

    expect(schemaIndex).toContain('import { author } from "./author";');
    expect(schemaIndex).toContain('import { blogPost } from "./blogPost";');
    expect(schemaIndex).toContain('import { destination } from "./destination";');
    expect(schemaIndex).toContain("export const schemaTypes = [destination, author, blogPost];");
  });

  it("defines optional author images and editorial identity fields", async () => {
    const author = await readSchema("author.ts");

    expect(author).toContain('name: "author"');
    expect(author).toContain('name: "name"');
    expect(author).toContain('name: "slug"');
    expect(author).toContain('source: "name"');
    expect(author).toContain('name: "avatar"');
    expect(author).toContain("hotspot: true");
    expect(author).toContain('name: "isFictional"');
    expect(author).toContain("initialValue: false");
  });

  it("uses the author document type and expected categories for blog posts", async () => {
    const blogPost = await readSchema("blogPost.ts");

    expect(blogPost).toContain('name: "blogPost"');
    expect(blogPost).toContain('name: "author"');
    expect(blogPost).toContain('type: "reference"');
    expect(blogPost).toContain('to: [{ type: "author" }]');
    expect(blogPost).toContain('{ title: "Engineering Logs", value: "engineering" }');
    expect(blogPost).toContain('{ title: "Debugging Dispatches", value: "debugging" }');
    expect(blogPost).toContain('{ title: "Universe Updates", value: "updates" }');
    expect(blogPost).toContain('{ title: "Universe Lore", value: "lore" }');
    expect(blogPost).toContain('name: "coverImage"');
    expect(blogPost).toContain("hotspot: true");
  });

  it("supports the expected Portable Text structures", async () => {
    const blogPost = await readSchema("blogPost.ts");

    expect(blogPost).toContain('type: "block"');
    expect(blogPost).toContain('{ title: "Heading 2", value: "h2" }');
    expect(blogPost).toContain('{ title: "Heading 3", value: "h3" }');
    expect(blogPost).toContain('{ title: "Bullet", value: "bullet" }');
    expect(blogPost).toContain('{ title: "Numbered", value: "number" }');
    expect(blogPost).toContain('{ title: "Bold", value: "strong" }');
    expect(blogPost).toContain('{ title: "Italic", value: "em" }');
    expect(blogPost).toContain('name: "link"');
    expect(blogPost).toContain('name: "image"');
    expect(blogPost).toContain('name: "alt"');
    expect(blogPost).toContain('name: "code"');
    expect(blogPost).toContain('name: "language"');
  });
});
