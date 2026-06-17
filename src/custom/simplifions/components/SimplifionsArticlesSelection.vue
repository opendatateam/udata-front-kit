<template>
  <div class="carousel">
    <div ref="track" class="carousel__track" @scroll.passive="onScroll">
      <div v-for="(item, index) in items" :key="index" class="carousel__item">
        <SimplifionsFolderCard
          v-if="item.type === 'folder'"
          :title="item.meta.title"
          :description="item.meta.description"
          :to="item.to"
          :article-count="item.articleCount"
        />
        <SimplifionsArticleCard
          v-else
          :article="item.card"
        />
      </div>
    </div>

    <div v-show="hasOverflow" class="carousel__nav">
      <button
        class="fr-link fr-link--sm fr-link--icon-left fr-icon-arrow-left-s-line"
        aria-label="Précédent"
        :disabled="!canPrev"
        @click="prev"
      >
        Précédent
      </button>
      <button
        class="fr-link fr-link--sm fr-link--icon-right fr-icon-arrow-right-s-line"
        aria-label="Suivant"
        :disabled="!canNext"
        @click="next"
      >
        Suivant
      </button>
    </div>

    <div class="carousel__cta">
      <RouterLink
        to="/guides"
        class="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
      >
        Voir tous les articles
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeaturedItem } from '../model/articles'
import SimplifionsFolderCard from './SimplifionsFolderCard.vue'
import SimplifionsArticleCard from './SimplifionsArticleCard.vue'
import { useCarouselScroll } from '../composables/useCarouselScroll'

defineProps<{ items: FeaturedItem[] }>()

const { track, hasOverflow, canPrev, canNext, onScroll, prev, next } =
  useCarouselScroll('.carousel__item')
</script>

<style scoped>
.carousel__track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.carousel__track::-webkit-scrollbar {
  display: none;
}

.carousel__item {
  flex: 0 0 calc(33.333% - 0.667rem);
  scroll-snap-align: start;
}

.carousel__nav {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.carousel__cta {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 62rem) {
  .carousel__item {
    flex: 0 0 calc(50% - 0.5rem);
  }
}

@media (max-width: 36rem) {
  .carousel__item {
    flex: 0 0 82%;
  }
}
</style>
