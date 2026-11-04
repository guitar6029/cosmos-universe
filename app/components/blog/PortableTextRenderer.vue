<script setup lang="ts">
import { h, type VNode } from "vue";
import type {
  PortableTextBlock,
  PortableTextContent,
  PortableTextImage,
  PortableTextSpan,
} from "../../types/blog";

const props = defineProps<{ blocks: PortableTextContent[] }>();

function safeHref(href: string): string | null {
  if (href.startsWith("/")) {
    return href;
  }

  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function renderSpan(span: PortableTextSpan, block: PortableTextBlock): VNode {
  let content: string | VNode = span.text;

  for (const mark of span.marks ?? []) {
    if (mark === "strong") {
      content = h("strong", content);
    } else if (mark === "em") {
      content = h("em", content);
    } else {
      const definition = block.markDefs?.find((candidate) => candidate._key === mark);
      const href = definition ? safeHref(definition.href) : null;

      if (href) {
        const external = href.startsWith("http");
        content = h(
          "a",
          external ? { href, rel: "noopener noreferrer", target: "_blank" } : { href },
          content,
        );
      }
    }
  }

  return h("span", { key: span._key }, content);
}

function renderBlock(block: PortableTextBlock): VNode {
  const tag = block.style === "h2" || block.style === "h3" ? block.style : "p";
  return h(
    tag,
    { key: block._key },
    block.children.map((span) => renderSpan(span, block)),
  );
}

function renderImage(image: PortableTextImage): VNode | null {
  if (!image.url) {
    return null;
  }

  return h("figure", { key: image._key }, [
    h("img", { alt: image.alt ?? "", loading: "lazy", src: image.url }),
    image.alt ? h("figcaption", image.alt) : null,
  ]);
}

function renderContent(blocks: PortableTextContent[]): VNode[] {
  const result: VNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (!block) {
      break;
    }

    if (block._type === "block" && block.listItem) {
      const listItem = block.listItem;
      const items: VNode[] = [];

      while (true) {
        const candidate = blocks[index];

        if (!candidate || candidate._type !== "block" || candidate.listItem !== listItem) {
          break;
        }

        const item = candidate;
        items.push(
          h(
            "li",
            { key: item._key },
            item.children.map((span) => renderSpan(span, item)),
          ),
        );
        index += 1;
      }

      result.push(h(listItem === "number" ? "ol" : "ul", { key: block._key }, items));
      continue;
    }

    if (block._type === "block") {
      result.push(renderBlock(block));
    } else if (block._type === "image") {
      const image = renderImage(block);
      if (image) result.push(image);
    } else if (block._type === "code") {
      result.push(
        h("pre", { key: block._key }, [
          h("code", { class: `language-${block.language ?? "plaintext"}` }, block.code),
        ]),
      );
    }

    index += 1;
  }

  return result;
}
</script>

<template>
  <div class="portable-text"><component :is="() => renderContent(props.blocks)" /></div>
</template>
