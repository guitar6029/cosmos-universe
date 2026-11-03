import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import AstroPopDeliveryTestimonialsSection from "../app/components/astro-pop/AstroPopDeliveryTestimonialsSection.vue";
import { ASTRO_POP_MEDIA } from "../app/data/astroPopMedia";

const renderSection = () =>
  renderToString(createSSRApp({ render: () => h(AstroPopDeliveryTestimonialsSection) }));

describe("AstroPop neighborhood testimonials", () => {
  it("renders a named section with its headline and supporting copy", async () => {
    const html = await renderSection();

    expect(html).toContain('aria-labelledby="astropop-testimonials-title"');
    expect(html).toMatch(
      /<h2[^>]*id="astropop-testimonials-title"[^>]*>\s*The Neighborhood Is Talking!\s*<\/h2>/,
    );
    expect(html).toContain("GOOD NEWS TRAVELS FAST!");
    expect(html).toContain("Everybody&#39;s buzzing about AstroPop!");
    expect(html.match(/<figure\b/g)).toHaveLength(3);
    expect(html.match(/<blockquote\b/g)).toHaveLength(3);
    expect(html.match(/<figcaption\b/g)).toHaveLength(3);
    const speechBubbles = html.match(/<figure\b[\s\S]*?<\/figure>/g) ?? [];
    expect(
      speechBubbles.every((bubble) =>
        /<figure\b[^>]*><blockquote\b[\s\S]*?<\/blockquote><figcaption\b[\s\S]*?<\/figcaption><\/figure>/.test(
          bubble,
        ),
      ),
    ).toBe(true);
  });

  it.each([
    [
      "Dorothy Miller",
      ASTRO_POP_MEDIA.testimonials.dorothy.portrait,
      "Dorothy Miller holding a bottle of AstroPop soda",
    ],
    [
      "Walter Peterson",
      ASTRO_POP_MEDIA.testimonials.walter.portrait,
      "Walter Peterson holding an AstroPop bottle with a golf club over his shoulder",
    ],
    [
      "Grandpa Henry",
      ASTRO_POP_MEDIA.testimonials.grandpaHenry.portrait,
      "Grandpa Henry pointing to his bottle of AstroPop soda",
    ],
  ])("places %s's accessible portrait above the quote", async (name, source, alt) => {
    const html = await renderSection();
    const portraitIndex = html.indexOf(`src="${source}"`);
    const quoteIndex = html.indexOf("<blockquote", portraitIndex);
    const nameIndex = html.indexOf(name, quoteIndex);

    expect(portraitIndex).toBeGreaterThan(-1);
    expect(html).toContain(`alt="${alt}"`);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(portraitIndex).toBeLessThan(quoteIndex);
    expect(quoteIndex).toBeLessThan(nameIndex);
  });

  it("renders Dorothy's static portrait as the initial server-rendered state", async () => {
    const html = await renderSection();

    expect(html).toContain(`src="${ASTRO_POP_MEDIA.testimonials.dorothy.portrait}"`);
    expect(html).not.toContain(ASTRO_POP_MEDIA.testimonials.dorothy.video);
  });

  it.each([
    [
      "Dorothy Miller",
      "Mother of Three",
      "Three hungry youngsters, a busy household, and somehow Bobby Bubbles always arrives right on time!",
    ],
    [
      "Walter Peterson",
      "Weekend Golfer",
      "Eighteen holes on the course, twelve bottles on the porch. Now that's what I call a perfect Sunday!",
    ],
    [
      "Grandpa Henry",
      "Proud AstroPop Customer",
      "In my day, the milkman brought milk. Now a fellow brings fizzy drinks from the future. What a marvelous century!",
    ],
  ])("preserves %s's exact quote and attribution", async (name, role, quote) => {
    const html = await renderSection();
    const figures = html.match(/<figure\b[\s\S]*?<\/figure>/g) ?? [];
    const figure = figures.find((markup) => markup.includes(name));

    expect(figure).toBeDefined();
    const quoteText = figure
      ?.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/)?.[1]
      .replace(/<[^>]*>/g, "")
      .replaceAll("&#39;", "'");
    const captionText = figure
      ?.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1]
      .replace(/<[^>]*>/g, "");

    expect(quoteText).toBe(`“${quote}”`);
    expect(captionText).toBe(`${name}${role}`);
  });
});
