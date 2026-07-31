<template>
  <div class="fr-container fr-py-8v">
    <h1>Articles</h1>


    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="article in articles"
        :key="article.slug"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <ArticleCard :article="article" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import ArticleCard from '../../components/article/ArticleCard.vue'
import { articles } from '../../model/articles'

useMeta({
  title: () => 'Articles',
  description: () =>
    'Guides et explications pour comprendre et intégrer les API utiles à la simplification de vos démarches.',
  canonicalUrl: useCanonicalUrl()
})
</script>
