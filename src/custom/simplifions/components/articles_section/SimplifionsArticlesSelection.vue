<template>
  <div class="carousel">
    <CarouselTrack>
      <li v-for="(item, index) in items" :key="index" class="carousel__item">
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
      </li>
    </CarouselTrack>

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
import type { FeaturedItem } from '../../model/articles'
import SimplifionsFolderCard from './SimplifionsFolderCard.vue'
import SimplifionsArticleCard from './SimplifionsArticleCard.vue'
import CarouselTrack from './CarouselTrack.vue'

defineProps<{ items: FeaturedItem[] }>()
</script>

<style scoped>
.carousel__item {
  flex: 0 0 calc(33.333% - 0.667rem);
  scroll-snap-align: start;
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
