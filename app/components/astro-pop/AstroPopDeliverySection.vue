<script setup lang="ts">
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import DecorativeImage from "../shared/DecorativeImage.vue";
</script>

<template>
  <div class="astropop-delivery-section-container decorative-container bg-[#efd099]">
    <section class="astropop-delivery-section" aria-labelledby="astropop-delivery-title">
      <div class="astropop-delivery-section__content">
        <p class="astropop-eyebrow astropop-delivery-section__eyebrow">Delivery Service</p>
        <h2 id="astropop-delivery-title">AstroPop Delivers!</h2>
        <p class="astropop-delivery-section__copy">
          Fresh bottles from tomorrow, delivered right to your door.
        </p>
        <a class="astropop-delivery-section__button" href="#astropop-delivery-plans">
          View Plans
        </a>
      </div>

      <div class="astropop-delivery-section__artwork">
        <img
          class="astropop-delivery-section__image"
          :src="ASTRO_POP_MEDIA.deliveryArtwork"
          alt="Retro AstroPop delivery adventure with a soda delivery rocket"
          loading="lazy"
        />
      </div>
    </section>

    <DecorativeImage
      class="astropop-flavor-section__cap"
      :src="ASTRO_POP_MEDIA.sodaCap"
      style="
        top: 90%;
        left: -5rem;
        width: 150px;
        opacity: 0.45;
        transform: rotate(-15deg);
        z-index: 0;
      "
    />

    <DecorativeImage
      class="astropop-flavor-section__cap"
      :src="ASTRO_POP_MEDIA.sodaCap"
      style="
        top: 10%;
        left: 95%;
        width: 150px;
        opacity: 0.45;
        transform: rotate(-15deg);
        z-index: 0;
      "
    />

    <DecorativeImage
      class="astropop-flavor-section__delivery_card"
      :src="ASTRO_POP_MEDIA.deliveryNote"
      style="top: 10%; left: 5%; width: 550px; opacity: 0.45; transform: rotate(-45deg); z-index: 0"
    />
  </div>
</template>

<style scoped src="./AstroPopDeliverySection.css"></style>
