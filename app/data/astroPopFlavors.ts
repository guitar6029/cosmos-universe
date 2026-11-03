import { ASTRO_POP_MEDIA } from "./astroPopMedia";

export type AstroPopTheme = "atomic-cherry" | "solar-citrus" | "lunar-lime" | "neptune-berry";

export interface AstroPopArtwork {
  label: string;
  pose: string;
  src: string;
  alt: string;
}

export interface AstroPopFlavor {
  id: string;
  name: string;
  description: string;
  slogan: string;
  theme: AstroPopTheme;
  bottleImage: string;
  artwork: AstroPopArtwork;
}

export const ASTROPOP_FLAVORS = [
  {
    id: "atomic-cherry-fizz",
    name: "Atomic Cherry Fizz",
    description:
      "A bright, bubbling cherry soda with enough sparkle to power your next trip around the moon.",
    slogan: "A Cherry Blast from Tomorrow!",
    theme: "atomic-cherry",
    bottleImage: ASTRO_POP_MEDIA.flavors.atomicCherry.bottle,
    artwork: {
      label: "Bottle and Astro Kid artwork",
      pose: "Astro Kid hugging a bottle",
      src: ASTRO_POP_MEDIA.flavors.atomicCherry.artwork,
      alt: "Vintage Atomic Cherry Fizz advertisement showing Astro Kid hugging a red AstroPop soda bottle.",
    },
  },
  {
    id: "solar-citrus-spark",
    name: "Solar Citrus Spark",
    description:
      "A golden citrus refresher that brings a little sunshine to every interplanetary picnic.",
    slogan: "Sunshine in Every Sip!",
    theme: "solar-citrus",
    bottleImage: ASTRO_POP_MEDIA.flavors.solarCitrus.bottle,
    artwork: {
      label: "Bottle and Astro Kid artwork",
      pose: "Astro Kid pointing toward a sunburst",
      src: ASTRO_POP_MEDIA.flavors.solarCitrus.artwork,
      alt: "Vintage Solar Citrus Spark advertisement showing Astro Kid pointing toward a sunburst beside an orange AstroPop soda bottle.",
    },
  },
  {
    id: "lunar-lime-lift",
    name: "Lunar Lime Lift",
    description: "A cool mint-lime fizz with a crisp, refreshing lift for high-flying afternoons.",
    slogan: "A Little Lift in Every Bottle!",
    theme: "lunar-lime",
    bottleImage: ASTRO_POP_MEDIA.flavors.lunarLime.bottle,
    artwork: {
      label: "Bottle and Astro Kid artwork",
      pose: "Astro Kid floating beside a bottle",
      src: ASTRO_POP_MEDIA.flavors.lunarLime.artwork,
      alt: "Vintage Lunar Lime Lift advertisement showing Astro Kid floating beside a green AstroPop soda bottle.",
    },
  },
  {
    id: "neptune-berry-fizz",
    name: "Neptune Berry Fizz",
    description:
      "A juicy berry soda in ocean-blue hues, made for splashy adventures among the stars.",
    slogan: "A Splash from the Stars!",
    theme: "neptune-berry",
    bottleImage: ASTRO_POP_MEDIA.flavors.neptuneBerry.bottle,
    artwork: {
      label: "Bottle and Astro Kid artwork",
      pose: "Astro Kid leaning against a bottle",
      src: ASTRO_POP_MEDIA.flavors.neptuneBerry.artwork,
      alt: "Vintage Neptune Berry Fizz advertisement showing Astro Kid leaning against a blue AstroPop soda bottle.",
    },
  },
] as const satisfies readonly AstroPopFlavor[];
