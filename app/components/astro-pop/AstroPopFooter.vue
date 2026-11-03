<template>
  <footer class="astropop-footer" aria-labelledby="astropop-footer-title">
    <div class="astropop-footer__inner">
      <div class="astropop-footer__header">
        <p class="astropop-eyebrow astropop-footer__eyebrow">A LITTLE SPARKLE IN EVERY BOTTLE</p>
        <h2 id="astropop-footer-title">Stay Fizzy, Folks!</h2>
        <p class="astropop-footer__tagline">
          AstroPop Soda Co. — Bringing Tomorrow to Your Doorstep!
        </p>
      </div>

      <div class="astropop-footer__navigation">
        <nav aria-labelledby="astropop-footer-explore-title">
          <h3 id="astropop-footer-explore-title">Explore AstroPop</h3>
          <ul>
            <li><NuxtLink to="/app/astro-pop/our-story">Our Story</NuxtLink></li>
            <li>
              <NuxtLink to="/app/astro-pop/#astropop-flavors-title">Our Marvelous Flavors</NuxtLink>
            </li>
            <li><NuxtLink to="/app/astro-pop/#pack-your-pop-title">Pack Your Pop</NuxtLink></li>
            <li>
              <NuxtLink to="/app/astro-pop/#astropop-delivery-plans">Delivery Plans</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/astro-pop/#astropop-delivery-testimonials"
                >Happy Neighbors</NuxtLink
              >
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="astropop-footer-universe-title">
          <h3 id="astropop-footer-universe-title">The Cosmoport Universe</h3>
          <ul>
            <li><NuxtLink to="/">Universe Directory</NuxtLink></li>
            <li><NuxtLink to="/app/cosmoport-voyage">Cosmoport Voyage</NuxtLink></li>
            <li><a href="#">Back to Top</a></li>
          </ul>
        </nav>
      </div>

      <p class="astropop-footer__bottom-line">
        AstroPop Soda Co. · A proud member of the Cosmoport Universe
      </p>
    </div>
  </footer>
</template>

<style scoped>
.astropop-footer {
  background: #49262e;
  color: #fff4da;
  font-family: "Barlow", Arial, sans-serif;
}

.astropop-footer__inner {
  width: min(100%, 80rem);
  margin-inline: auto;
  padding: clamp(3.5rem, 7vw, 6rem) clamp(1rem, 4vw, 3rem) 2rem;
}

.astropop-footer__header {
  text-align: center;
}

.astropop-footer__eyebrow {
  margin: 0 0 1.25rem;
  color: #e6c486;
  font-size: 0.85rem;
  letter-spacing: 0.16em;
  line-height: 1.5;
}

.astropop-footer h2 {
  margin: 0;
  font-family: "Fraunces", Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 6.5vw, 5.5rem);
  font-weight: 900;
  line-height: 1.05;
  text-wrap: balance;
}

.astropop-footer__tagline {
  max-width: 40rem;
  margin: 1.5rem auto 0;
  font-family: "Fraunces", Georgia, "Times New Roman", serif;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-style: italic;
  font-weight: 700;
  line-height: 1.5;
  text-wrap: balance;
}

.astropop-footer__navigation {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.25rem;
  margin-top: clamp(2.5rem, 5vw, 4rem);
  border-top: 3px double rgba(230, 196, 134, 0.5);
  border-bottom: 1px solid rgba(230, 196, 134, 0.5);
  padding-block: 2.5rem;
  text-align: center;
}

.astropop-footer h3 {
  margin: 0 0 0.75rem;
  color: #e6c486;
  font-family: "Fraunces", Georgia, "Times New Roman", serif;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.4;
}

.astropop-footer ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.astropop-footer a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  padding: 0.5rem;
  color: inherit;
  line-height: 1.5;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.25em;
}

.astropop-footer a:hover,
.astropop-footer a:focus-visible {
  color: #9bd4cb;
  text-decoration-color: currentColor;
}

.astropop-footer a:focus-visible {
  border-radius: 0.125rem;
  outline: 2px solid #9bd4cb;
  outline-offset: 3px;
}

.astropop-footer__bottom-line {
  margin: 1.75rem 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  text-align: center;
  text-wrap: balance;
}

@media (min-width: 640px) {
  .astropop-footer__navigation {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
