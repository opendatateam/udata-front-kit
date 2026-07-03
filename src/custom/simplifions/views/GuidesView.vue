<template>
  <div class="guides-page">
    <div class="fr-container">
      <DsfrBreadcrumb :links="breadcrumbLinks" />
    </div>

    <section>
      <div class="fr-container fr-mb-4w">
        <h1 class="fr-h1">{{ themeMeta.title }}</h1>
        <p class="fr-text--lead fr-mb-0">{{ themeMeta.description }}</p>
      </div>
    </section>

    <div class="fr-container fr-pb-8w">
      <h2 class="fr-h3 fr-mb-3w">Dossiers</h2>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="folder in folders"
          :key="folder.meta.id"
          class="fr-col-12 fr-col-md-6"
        >
          <SimplifionsFolderCard
            :title="folder.meta.title"
            :description="folder.meta.description"
            :to="`/${themeMeta.id}/${folder.meta.id}`"
            :article-count="folder.articles.length"
          />
        </div>
      </div>

      <section v-if="rootArticles.length" class="fr-mt-8w">
        <h2 class="fr-h3 fr-mb-3w">Articles</h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="article in rootArticles"
            :key="article.to"
            class="fr-col-12 fr-col-md-6 fr-col-xl-4"
          >
            <SimplifionsArticleCard :article="article" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import SimplifionsArticleCard from '../components/SimplifionsArticleCard.vue'
import SimplifionsFolderCard from '../components/SimplifionsFolderCard.vue'
import { folders, rootArticles, themeMeta } from './Articles'

const breadcrumbLinks = [
  { to: '/', text: 'Accueil' },
  { text: themeMeta.title }
]

useHead({
  bodyAttrs: { style: 'background-color: var(--background-alt-blue-france)' }
})
</script>

<style scoped>
.guides-page {
  background: var(--background-alt-blue-france);
  overflow: hidden;
}





</style>
