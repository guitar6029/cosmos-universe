import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import PortableTextRenderer from "../app/components/blog/PortableTextRenderer.vue";
import type { PortableTextContent } from "../app/types/blog";

const render = (blocks: PortableTextContent[]) =>
  renderToString(createSSRApp({ render: () => h(PortableTextRenderer, { blocks }) }));

describe("Portable Text renderer", () => {
  it("renders formatted text, safe links, lists, code blocks, and images", async () => {
    const html = await render([
      {
        _key: "intro",
        _type: "block",
        children: [
          { _key: "bold", _type: "span", marks: ["strong"], text: "Bold" },
          { _key: "plain", _type: "span", text: " and " },
          { _key: "italic", _type: "span", marks: ["em"], text: "italic" },
          { _key: "link", _type: "span", marks: ["external-link"], text: " link" },
        ],
        markDefs: [{ _key: "external-link", _type: "link", href: "https://example.com/news" }],
      },
      {
        _key: "one",
        _type: "block",
        children: [{ _key: "item-one", _type: "span", text: "One" }],
        listItem: "bullet",
      },
      {
        _key: "two",
        _type: "block",
        children: [{ _key: "item-two", _type: "span", text: "Two" }],
        listItem: "number",
      },
      { _key: "code", _type: "code", code: "const launch = true;", language: "ts" },
      {
        _key: "image",
        _type: "image",
        alt: "A Chronicle terminal",
        url: "https://cdn.sanity.io/images/example/terminal.jpg",
      },
    ]);

    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain('href="https://example.com/news"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain('<code class="language-ts">const launch = true;</code>');
    expect(html).toContain('alt="A Chronicle terminal"');
  });

  it("allows site-relative links but omits protocol-relative and unsafe links", async () => {
    const html = await render([
      {
        _key: "links",
        _type: "block",
        children: [
          { _key: "internal", _type: "span", marks: ["internal-link"], text: "Internal" },
          {
            _key: "protocol-relative",
            _type: "span",
            marks: ["protocol-relative-link"],
            text: "Protocol",
          },
          { _key: "unsafe", _type: "span", marks: ["unsafe-link"], text: "Unsafe" },
        ],
        markDefs: [
          { _key: "internal-link", _type: "link", href: "/blog" },
          { _key: "protocol-relative-link", _type: "link", href: "//example.com" },
          { _key: "unsafe-link", _type: "link", href: "javascript:alert(1)" },
        ],
      },
    ]);

    expect(html).toContain('href="/blog"');
    expect(html).not.toContain("//example.com");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("><span>Protocol</span><span>Unsafe</span>");
  });
});
