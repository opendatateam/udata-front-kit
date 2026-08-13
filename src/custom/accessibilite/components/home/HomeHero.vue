<script setup lang="ts">
import { useRouter } from 'vue-router'
import CustomSearch from './CustomSearch.vue'

const router = useRouter()
const searchQuery = ref('')

const doSearch = (q: string) => {
  router
    .push({ name: 'datasets', query: { q } })
    .then(() => (searchQuery.value = ''))
}
</script>

<template>
  <section
    class="hero-section fr-py-8w fr-pb-10w fr-background-alt--yellow-moutarde"
  >
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-lg-9">
          <h1>Trouver les données d’accessibilité de votre territoire</h1>
          <CustomSearch @on-search="doSearch" />
        </div>
        <div class="fr-col-12 fr-col-lg-3">
          <picture class="illustration">
            <source
              srcset="/static/accessibilite/assets/illustration-homepage.avif"
              type="image/avif"
            />
            <img
              src="/static/accessibilite/assets/illustration-homepage.jpg"
              alt=""
              width="501"
              height="360"
            />
          </picture>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  isolation: isolate;
  /* match illustration height */
  min-block-size: 360px;
}
h1 {
  max-inline-size: 28ch;
  /* fluid typography: 32px at ~375px viewport → 40px at ~992px viewport */
  font-size: clamp(2rem, 1.3vw + 1.7rem, 2.5rem);
}
.illustration {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: 0;

  translate: 0 -50%;
  z-index: -1;

  @media (width < 78rem) {
    display: none;
  }
}
</style>
