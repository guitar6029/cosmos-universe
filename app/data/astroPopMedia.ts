export const ASTRO_POP_MEDIA_BASE_URL = "https://media.cosmos-universe.com/astro-pop";

const cdnMedia = (key: string) => `${ASTRO_POP_MEDIA_BASE_URL}/${key}`;

/** Verified public R2 object keys for Astro Pop media. */
export const ASTRO_POP_MEDIA = {
  hero: cdnMedia("hero/astropopman-delivers-cosmic-cheer.png"),
  loadingRocket: cdnMedia("loading/astro-boy-loading.png"),
  deliveryArtwork: cdnMedia("hero/astropop-delivers-retro-soda-adventure.png"),
  sodaCap: cdnMedia("drinks/vintage-astropop-soda-cap.png"),
  bottleOpener: cdnMedia("accents/astro-pop-bottle-opener.png"),
  deliveryNote: cdnMedia("accents/astro-pop-soda-company-delivery-note.png"),
  packYourPopLogo: cdnMedia("drinks/astropop-pack-your-pop-logo.png"),
  cartCrate: cdnMedia("cart/retro-soda-crate-with-space-emblem.png"),
  cart: cdnMedia("cart/retro-atomic-shopping-cart.png"),
  deliveryCrates: {
    small: cdnMedia("drinks/astropop-crate-small.png"),
    medium: cdnMedia("drinks/astropop-crate-medium.png"),
    large: cdnMedia("drinks/astropop-crate-large.png"),
  },
  flavors: {
    atomicCherry: {
      bottle: cdnMedia("drinks/astropop-atomic-cherry-fizz-bottle.png"),
      artwork: cdnMedia("drinks/astropop-atomic-cherry-fizz.png"),
    },
    solarCitrus: {
      bottle: cdnMedia("drinks/astropop-solar-citrus-spark-bottle.png"),
      artwork: cdnMedia("drinks/solar-citrus-spark-retro-poster.png"),
    },
    lunarLime: {
      bottle: cdnMedia("drinks/astropop-lunar-lime-lift-bottle.png"),
      artwork: cdnMedia("drinks/astropop-lunar-lime-lift-retro-ad.png"),
    },
    neptuneBerry: {
      bottle: cdnMedia("drinks/astropop-neptune-berry-fizz-bottle.png"),
      artwork: cdnMedia("drinks/neptune-berry-fizz-space-adventure.png"),
    },
  },
  notifications: {
    success: cdnMedia("notification/astro-pop-toast-success.png"),
    error: cdnMedia("notification/astro-pop-toast-error.png"),
    info: cdnMedia("notification/astro-pop-toast-info.png"),
  },
  story: {
    hero: cdnMedia("our_story/1950s-backyard-soda-making-sunset.png"),
    lemonadeStand: cdnMedia("our_story/vintage-lemonade-stand-polaroid.png"),
    familyDay: cdnMedia("our_story/a-family-day-at-astro-pop-soda-co.png"),
    neighborhood: cdnMedia("our_story/astro-pop-neighborhood-block-party.png"),
  },
  testimonials: {
    dorothy: {
      portrait: cdnMedia("testimonials/dorothy-miller.jpg"),
      video: cdnMedia("testimonials/dorothy-miller.mp4"),
    },
    walter: {
      portrait: cdnMedia("testimonials/walter-peterson.jpg"),
      video: cdnMedia("testimonials/walter-peterson.mp4"),
    },
    grandpaHenry: {
      portrait: cdnMedia("testimonials/grandpa-henry.jpg"),
      video: cdnMedia("testimonials/grandpa-henry.mp4"),
    },
    sign: cdnMedia("testimonials/the-neighborhood-is-talking-retro-sign.png"),
    backdrop: cdnMedia("testimonials/retro-futuristic-suburban-utopia.png"),
  },
} as const;
