<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { getWrappedIndex } from "../../utils/carouselNavigation";

interface DestinationSectionProps {
  slug?: string;
  destinationLabel?: string;
  guideLabel?: string;
  guideTitle?: string;
  guideSubtitle?: string;
  fallbackName?: string;
  sectionId?: string;
  theme?: "destination" | "pearlwater" | "saffron";
}

const props = withDefaults(defineProps<DestinationSectionProps>(), {
  slug: "aurora-city",
  destinationLabel: "Destination 01 · Velora-7",
  guideLabel: "City guide",
  guideTitle: "Explore Aurora City",
  guideSubtitle: "Five Spectacular Ways to Experience Tomorrow.",
  fallbackName: "Aurora City",
  sectionId: "destination-title",
  theme: "destination",
});

interface SanityImage {
  asset?: {
    _ref?: string;
  };
  altText?: string;
}

interface DestinationHighlight {
  _key: string;
  title?: string;
  description?: string;
  image?: SanityImage;
  altText?: string;
}

interface DestinationContent {
  name?: string;
  tagline?: string;
  description?: string;
  heroImage?: SanityImage;
  altText?: string;
  guideBadgeImage?: SanityImage;
  highlights?: DestinationHighlight[];
}

const destinationQuery = `*[
  _type == "destination" &&
  slug.current == $slug
][0] {
  name,
  tagline,
  description,
  heroImage,
  altText,
  guideBadgeImage {
    asset,
    altText
  },
  highlights[] {
    _key,
    title,
    description,
    image,
    altText
  }
}`;

const { data, error, pending } = await useSanityQuery<DestinationContent | null>(destinationQuery, {
  slug: props.slug,
});

const carousel = ref<HTMLElement | null>(null);
const selectedIndex = ref(0);
let scrollFrame: number | undefined;
let programmaticIndex: number | undefined;
let programmaticResetFrame: number | undefined;

const destination = computed(() => data.value);
const highlights = computed(() => destination.value?.highlights ?? []);
const hasContent = computed(() => Boolean(destination.value));

const imageAssetId = (image?: SanityImage) => image?.asset?._ref;

const scrollToHighlight = (index: number) => {
  const count = highlights.value.length;

  if (!count) {
    return;
  }

  const nextIndex = getWrappedIndex(index, count);
  const card = carousel.value?.querySelector<HTMLElement>(`[data-highlight-index="${nextIndex}"]`);

  if (!card || !carousel.value) {
    return;
  }

  const targetScrollLeft = card.offsetLeft - (carousel.value.clientWidth - card.offsetWidth) / 2;
  const maxScrollLeft = carousel.value.scrollWidth - carousel.value.clientWidth;

  selectedIndex.value = nextIndex;
  programmaticIndex = nextIndex;
  carousel.value.scrollTo({
    left: Math.min(maxScrollLeft, Math.max(0, targetScrollLeft)),
    behavior: "auto",
  });

  if (programmaticResetFrame !== undefined) {
    cancelAnimationFrame(programmaticResetFrame);
  }

  programmaticResetFrame = requestAnimationFrame(() => {
    programmaticIndex = undefined;
    programmaticResetFrame = undefined;
  });
};

const handleCarouselKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    scrollToHighlight(selectedIndex.value - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    scrollToHighlight(selectedIndex.value + 1);
  }
};

const updateSelectedIndex = () => {
  if (!carousel.value) {
    return;
  }

  const cards = carousel.value.querySelectorAll<HTMLElement>("[data-highlight-index]");

  // Keep the initial left edge stable, but let manual scrolling determine the
  // active card everywhere else. Arrow navigation is protected separately by
  // programmaticIndex so a clamped scroll cannot replace its requested index.
  if (carousel.value.scrollLeft <= 1 && selectedIndex.value === 0) {
    selectedIndex.value = 0;
    return;
  }

  const carouselCenter = carousel.value.scrollLeft + carousel.value.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - carouselCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = Number(card.dataset.highlightIndex);
    }
  });

  if (!Number.isNaN(closestIndex)) {
    selectedIndex.value = closestIndex;
  }
};

const handleCarouselScroll = () => {
  if (programmaticIndex !== undefined) {
    selectedIndex.value = programmaticIndex;
    programmaticIndex = undefined;

    if (programmaticResetFrame !== undefined) {
      cancelAnimationFrame(programmaticResetFrame);
      programmaticResetFrame = undefined;
    }

    return;
  }

  if (scrollFrame !== undefined) {
    cancelAnimationFrame(scrollFrame);
  }

  scrollFrame = requestAnimationFrame(() => {
    updateSelectedIndex();
    scrollFrame = undefined;
  });
};

onMounted(() => {
  if (!carousel.value || !highlights.value.length) {
    return;
  }

  carousel.value.addEventListener("scroll", handleCarouselScroll, { passive: true });
  updateSelectedIndex();
});

onBeforeUnmount(() => {
  carousel.value?.removeEventListener("scroll", handleCarouselScroll);

  if (scrollFrame !== undefined) {
    cancelAnimationFrame(scrollFrame);
  }

  if (programmaticResetFrame !== undefined) {
    cancelAnimationFrame(programmaticResetFrame);
  }
});
</script>

<template>
  <section
    class="destination-section"
    :class="`destination-section--${props.theme}`"
    :aria-labelledby="props.sectionId"
  >
    <div class="destination-section__inner">
      <div v-if="pending" class="destination-status" role="status">
        Preparing the {{ props.fallbackName }} departure board…
      </div>

      <div v-else-if="error || !hasContent" class="destination-status">
        <p class="destination-status__eyebrow">CosmoPort destination desk</p>
        <h2 :id="props.sectionId">{{ props.fallbackName }} is preparing for departure.</h2>
        <p>Destination details will appear here when the city is ready for visitors.</p>
      </div>

      <template v-else>
        <div class="destination-intro">
          <div class="destination-copy">
            <p class="destination-eyebrow">{{ props.destinationLabel }}</p>
            <h2 :id="props.sectionId">{{ destination?.name || props.fallbackName }}</h2>
            <p v-if="destination?.tagline" class="destination-tagline">
              {{ destination.tagline }}
            </p>
            <p v-if="destination?.description" class="destination-description">
              {{ destination.description }}
            </p>
          </div>

          <div v-if="imageAssetId(destination?.heroImage)" class="destination-hero-image">
            <SanityImage
              :asset-id="imageAssetId(destination?.heroImage)"
              :alt="
                destination?.altText || `${destination?.name || props.fallbackName} destination`
              "
              width="960"
              height="620"
              sizes="sm:100vw md:50vw lg:45vw"
            />
          </div>
        </div>

        <div v-if="highlights.length" class="destination-attractions">
          <div class="destination-attractions__heading">
            <div>
              <div
                v-if="imageAssetId(destination?.guideBadgeImage)"
                class="destination-guide-badge"
              >
                <SanityImage
                  :asset-id="imageAssetId(destination?.guideBadgeImage)"
                  :alt="destination?.guideBadgeImage?.altText || props.guideLabel"
                  width="520"
                  height="170"
                  sizes="sm:280px md:400px"
                />
              </div>
              <p v-else class="destination-eyebrow">{{ props.guideLabel }}</p>
              <h3>{{ props.guideTitle }}</h3>
              <p class="destination-attractions__subtitle">{{ props.guideSubtitle }}</p>
            </div>
            <div class="destination-controls">
              <button
                type="button"
                class="destination-control"
                :disabled="highlights.length < 2"
                :aria-label="`Previous ${props.fallbackName} attraction`"
                @click="scrollToHighlight(selectedIndex - 1)"
              >
                ←
              </button>
              <span class="destination-position" aria-live="polite">
                {{ String(selectedIndex + 1).padStart(2, "0") }} /
                {{ String(highlights.length).padStart(2, "0") }}
              </span>
              <button
                type="button"
                class="destination-control"
                :disabled="highlights.length < 2"
                :aria-label="`Next ${props.fallbackName} attraction`"
                @click="scrollToHighlight(selectedIndex + 1)"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref="carousel"
            class="destination-carousel"
            tabindex="0"
            role="region"
            :aria-label="`${props.fallbackName} attractions`"
            @keydown="handleCarouselKeydown"
          >
            <article
              v-for="(highlight, index) in highlights"
              :key="highlight._key"
              :data-highlight-index="index"
              class="destination-card"
              :class="{ 'is-selected': selectedIndex === index }"
              :aria-current="selectedIndex === index ? 'true' : undefined"
            >
              <div v-if="imageAssetId(highlight.image)" class="destination-card__image">
                <SanityImage
                  :asset-id="imageAssetId(highlight.image)"
                  :alt="highlight.altText || highlight.title || `${props.fallbackName} attraction`"
                  width="720"
                  height="840"
                  sizes="sm:82vw md:42vw lg:30vw"
                />
              </div>
              <div
                v-else
                class="destination-card__image destination-card__image--empty"
                aria-hidden="true"
              >
                <span>CPV / {{ props.fallbackName }}</span>
              </div>
              <div class="destination-card__body">
                <p class="destination-card__number">0{{ index + 1 }}</p>
                <h4>{{ highlight.title || `${props.fallbackName} attraction` }}</h4>
                <p v-if="highlight.description">{{ highlight.description }}</p>
              </div>
            </article>
          </div>
        </div>

        <p v-else class="destination-status destination-status--compact">
          {{ props.fallbackName }} attractions are still being charted.
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped src="./DestinationSection.css"></style>
