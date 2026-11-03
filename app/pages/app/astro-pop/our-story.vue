<script setup lang="ts">
import AstroPopFooter from "../../../components/astro-pop/AstroPopFooter.vue";
import AstroPopNav from "../../../components/astro-pop/AstroPopNav.vue";
import { ASTRO_POP_MEDIA } from "../../../data/astroPopMedia";
import DecorativeImage from "../../../components/shared/DecorativeImage.vue";

useHead({
  title: "Our Story | AstroPop Soda Co.",
  meta: [
    {
      name: "description",
      content: "Discover the backyard beginnings of AstroPop Soda Co.",
    },
  ],
});
</script>

<template>
  <div class="astropop-our-story-page">
    <main>
      <section class="astropop-our-story-hero" aria-labelledby="astropop-our-story-title">
        <img
          class="astropop-our-story-hero__image"
          :src="ASTRO_POP_MEDIA.story.hero"
          alt="A father pouring homemade red soda beside his smiling family at a backyard table at sunset"
        />
        <div class="astropop-our-story-hero__wash" aria-hidden="true" />

        <NuxtLink class="astropop-our-story-hero__back-link" to="/app/astro-pop">
          <span aria-hidden="true">←</span> Back to AstroPop
        </NuxtLink>

        <div class="astropop-our-story-hero__nav">
          <AstroPopNav />
        </div>

        <div class="astropop-our-story-hero__content">
          <p class="astropop-our-story-hero__eyebrow">
            Our Story <span aria-hidden="true">•</span> Est. 1957
          </p>
          <h1 id="astropop-our-story-title">It Started on the Porch.</h1>
          <p class="astropop-our-story-hero__description">
            Before Astro Pop became a household name, it was just Herbert “Herb” Walker, a backyard
            full of homemade soda experiments, and a family eager to taste the next batch.
          </p>
        </div>
      </section>

      <section class="astropop-porch-years" aria-labelledby="astropop-porch-years-title">
        <DecorativeImage
          class="astropop-porch-years__cap astropop-porch-years__cap--upper-left"
          :src="ASTRO_POP_MEDIA.sodaCap"
        />
        <DecorativeImage
          class="astropop-porch-years__cap astropop-porch-years__cap--lower-left"
          :src="ASTRO_POP_MEDIA.sodaCap"
        />
        <DecorativeImage
          class="astropop-porch-years__cap astropop-porch-years__cap--lower-right"
          :src="ASTRO_POP_MEDIA.sodaCap"
        />

        <div class="astropop-porch-years__inner">
          <div class="astropop-porch-years__image-wrap">
            <img
              class="astropop-porch-years__image"
              :src="ASTRO_POP_MEDIA.story.lemonadeStand"
              alt="Herbert Walker stirring a bright red batch of homemade soda on the family back porch"
            />
          </div>

          <div class="astropop-porch-years__content">
            <p class="astropop-porch-years__eyebrow">
              The Beginning <span aria-hidden="true">•</span> 1957
            </p>
            <h2 id="astropop-porch-years-title">The Porch Years</h2>
            <p>
              In 1957, Herbert “Herb” Walker wasn't trying to build a soda empire. He just wanted to
              make a darn good bottle of pop.
            </p>
            <p>
              Most afternoons, you'd find him on the family back porch, surrounded by glass bottles,
              fresh fruit, handwritten recipes, and the occasional sticky mess. Some batches were
              too sweet. Others didn't have quite enough fizz. But Herb kept tinkering.
            </p>
            <p>
              His most enthusiastic taste tester? His young son, who never missed a chance to try
              Dad's latest creation.
            </p>

            <figure class="astropop-porch-years__quote">
              <blockquote>
                “If it's not good enough for our family table, it's not good enough for anybody
                else's.”
              </blockquote>
              <figcaption>— Herb Walker</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section class="astropop-first-shop" aria-labelledby="astropop-first-shop-title">
        <div class="astropop-first-shop__inner">
          <div class="astropop-first-shop__content">
            <p class="astropop-first-shop__eyebrow">
              The First Shop <span aria-hidden="true">•</span> From Porch to Main Street
            </p>
            <h2 id="astropop-first-shop-title">A Storefront of Our Own</h2>
            <p>
              It started with a few bottles shared over the backyard fence. Then friends brought
              friends, neighbors told neighbors, and before long, the Walkers had more requests than
              their little porch could handle.
            </p>
            <p>
              One evening, Herb looked at the growing pile of orders, turned to his family, and
              said, "Well… I think we're going to need a bigger porch."
            </p>
            <p>
              With a little savings, a whole lot of hard work, and his family by his side, Herb
              opened the first Astro Pop Soda Co. shop. It was a modest little storefront with a
              striped awning, shelves of freshly bottled pop, and a door that was always open to the
              neighborhood.
            </p>
            <p class="astropop-first-shop__closing-line">
              It wasn't fancy. It wasn't big. But it was theirs.
            </p>
          </div>

          <figure class="astropop-first-shop__photo-frame">
            <img
              class="astropop-first-shop__photo"
              :src="ASTRO_POP_MEDIA.story.familyDay"
              alt="The Walker family standing outside the first Astro Pop Soda Co. storefront beneath its striped awning and hand-painted sign"
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section class="astropop-neighborhood" aria-labelledby="astropop-neighborhood-title">
        <div class="astropop-neighborhood__introduction">
          <p class="astropop-neighborhood__eyebrow">
            Today <span aria-hidden="true">•</span> The Astro Pop Promise
          </p>
          <h2 id="astropop-neighborhood-title">A Bigger Neighborhood. The Same Promise.</h2>
          <p>
            What began on one little back porch has grown into more than 250 Astro Pop locations,
            with bottles making their way to family tables and front porches all across America.
          </p>
          <p>
            But no matter how much we've grown, we haven't forgotten what got us here: good soda,
            good people, and a recipe worth sharing. Herb's original spirit still lives on in every
            bottle we make and every customer we serve.
          </p>
          <p>
            So grab a Pop, pull up a chair, and enjoy it with your family and friends. Some things
            are simply better when shared.
          </p>
        </div>

        <figure class="astropop-neighborhood__photo-wrap">
          <img
            class="astropop-neighborhood__photo"
            :src="ASTRO_POP_MEDIA.story.neighborhood"
            alt="Families sharing Astro Pop at porches and a picnic table during a neighborhood celebration, with an Astro Pop delivery van on the street"
            loading="lazy"
          />
        </figure>

        <div class="astropop-neighborhood__closing">
          <p>Made for good times, since 1957.</p>
          <NuxtLink to="/app/astro-pop/#astropop-flavors-title">Explore Our Flavors</NuxtLink>
        </div>
      </section>
    </main>
    <AstroPopFooter />
  </div>
</template>

<style scoped src="./our-story.css"></style>
