<script setup lang="ts">
import { ref } from "vue";
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import AstroPopAnimatedTestimonialAvatar from "./AstroPopAnimatedTestimonialAvatar.vue";

type AnimatedAvatar = InstanceType<typeof AstroPopAnimatedTestimonialAvatar>;

const animatedAvatars = ref<Record<string, AnimatedAvatar | undefined>>({});

const replayTestimonialAvatar = (name: string) => {
  animatedAvatars.value[name]?.replayOnHover();
};

const setTestimonialAvatar = (name: string, avatar: AnimatedAvatar | null) => {
  if (avatar) {
    animatedAvatars.value[name] = avatar;
  } else {
    const { [name]: _removedAvatar, ...remainingAvatars } = animatedAvatars.value;
    animatedAvatars.value = remainingAvatars;
  }
};

const testimonials = [
  {
    name: "Dorothy Miller",
    role: "Mother of Three",
    portrait: ASTRO_POP_MEDIA.testimonials.dorothy.portrait,
    portraitVideo: ASTRO_POP_MEDIA.testimonials.dorothy.video,
    portraitAlt: "Dorothy Miller holding a bottle of AstroPop soda",
    quote:
      "Three hungry youngsters, a busy household, and somehow Bobby Bubbles always arrives right on time!",
  },
  {
    name: "Walter Peterson",
    role: "Weekend Golfer",
    portrait: ASTRO_POP_MEDIA.testimonials.walter.portrait,
    portraitVideo: ASTRO_POP_MEDIA.testimonials.walter.video,
    portraitAlt: "Walter Peterson holding an AstroPop bottle with a golf club over his shoulder",
    quote:
      "Eighteen holes on the course, twelve bottles on the porch. Now that's what I call a perfect Sunday!",
  },
  {
    name: "Grandpa Henry",
    role: "Proud AstroPop Customer",
    portrait: ASTRO_POP_MEDIA.testimonials.grandpaHenry.portrait,
    portraitVideo: ASTRO_POP_MEDIA.testimonials.grandpaHenry.video,
    portraitAlt: "Grandpa Henry pointing to his bottle of AstroPop soda",
    quote:
      "In my day, the milkman brought milk. Now a fellow brings fizzy drinks from the future. What a marvelous century!",
  },
];
</script>

<template>
  <section
    id="astropop-delivery-testimonials"
    class="astropop-testimonials"
    aria-labelledby="astropop-testimonials-title"
    :style="{
      backgroundImage: `linear-gradient(180deg, rgba(255, 244, 214, 0.18), rgba(255, 244, 214, 0.08)), url(${ASTRO_POP_MEDIA.testimonials.backdrop})`,
    }"
  >
    <img
      class="astropop-testimonials__sign"
      :src="ASTRO_POP_MEDIA.testimonials.sign"
      alt=""
      aria-hidden="true"
    />
    <div class="astropop-testimonials__content">
      <header class="astropop-testimonials__header">
        <h2 id="astropop-testimonials-title" class="astropop-testimonials__title">
          The Neighborhood Is Talking!
        </h2>
        <p class="astropop-eyebrow astropop-testimonials__eyebrow">GOOD NEWS TRAVELS FAST!</p>
        <p class="astropop-testimonials__subtitle">Everybody's buzzing about AstroPop!</p>
      </header>

      <div class="astropop-testimonials__clippings">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.name"
          class="astropop-testimonial"
          @pointerenter="replayTestimonialAvatar(testimonial.name)"
        >
          <div class="astropop-testimonial__portrait">
            <AstroPopAnimatedTestimonialAvatar
              v-if="testimonial.portraitVideo"
              :ref="
                (avatar) => setTestimonialAvatar(testimonial.name, avatar as AnimatedAvatar | null)
              "
              :image-src="testimonial.portrait"
              :image-alt="testimonial.portraitAlt"
              :video-src="testimonial.portraitVideo"
              :replay-label="`Replay ${testimonial.name}'s animation`"
            />
            <img
              v-else
              :src="testimonial.portrait"
              :alt="testimonial.portraitAlt"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figure class="astropop-testimonial__message">
            <blockquote>
              <p>“{{ testimonial.quote }}”</p>
            </blockquote>
            <figcaption>
              <span class="astropop-testimonial__name">{{ testimonial.name }}</span>
              <span class="astropop-testimonial__role">{{ testimonial.role }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./AstroPopDeliveryTestimonialsSection.css"></style>
