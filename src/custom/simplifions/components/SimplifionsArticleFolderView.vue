<template>
  <div class="folder-page">
    <header class="folder-hero">
      <div
        v-if="heroImageSrc"
        class="folder-hero__media"
        :style="heroImageStyle"
        aria-hidden="true"
      ></div>
      <div
        v-else
        class="folder-hero__backdrop"
        :style="heroBackdropStyle"
        aria-hidden="true"
      ></div>

      <div v-if="breadcrumbLinks.length" class="fr-container folder-hero__breadcrumb">
        <DsfrBreadcrumb :links="breadcrumbLinks" />
      </div>

      <div class="fr-container folder-hero__inner">
        <div class="folder-hero__content">
          <p class="folder-hero__kicker">
            <span class="fr-icon-folder-2-line fr-icon--sm" aria-hidden="true"></span>
            Dossier
          </p>
          <h1 class="folder-hero__title">{{ title }}</h1>
          <p v-if="lead" class="folder-hero__lead">{{ lead }}</p>
        </div>
      </div>
    </header>

    <div class="fr-container folder-shell">
      <div v-if="articles.length" class="fr-grid-row fr-grid-row--gutters folder-cards">
        <div
          v-for="article in articles"
          :key="article.to"
          class="fr-col-12 fr-col-md-6 fr-col-xl-4"
        >
          <ArticleCard :article="article" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@/model/breadcrumb'
import type { SimplifionsArticleCard } from '../model/articles'
import ArticleCard from './SimplifionsArticleCard.vue'

const props = withDefaults(
  defineProps<{
    title: string
    lead?: string
    heroImageSrc?: string
    heroBackdropGradient?: string
    breadcrumbLinks?: readonly BreadcrumbItem[]
    articles: readonly SimplifionsArticleCard[]
  }>(),
  {
    lead: '',
    heroImageSrc: '',
    heroBackdropGradient: 'linear-gradient(135deg, #bfccfb 0%, #fef7da 100%)',
    breadcrumbLinks: () => []
  }
)

const heroBackdropStyle = computed(() => ({
  backgroundColor: '#bfccfb',
  backgroundImage: props.heroBackdropGradient
}))

const heroImageStyle = computed(() => ({
  backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.24)), url(${props.heroImageSrc})`
}))
</script>

<style scoped>
.folder-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: clamp(14rem, 20vw, 18rem);
  color: var(--text-default-grey);
}

.folder-hero__backdrop,
.folder-hero__media {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.folder-hero__breadcrumb {
  position: relative;
  z-index: 2;
  padding-top: 1rem;
}

.folder-hero__inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 0 2.5rem;
}

.folder-hero__content {
  max-width: 52rem;
}

.folder-hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0.3rem 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-title-blue-france);
  background-color: var(--background-default-grey);
  border-radius: 999px;
}

.folder-hero__title {
  margin: 0;
  font-size: clamp(2rem, 3.8vw, 3.2rem);
  line-height: 1.08;
}

.folder-hero__lead {
  margin: 1rem auto 0;
  max-width: 56ch;
  font-size: clamp(1.05rem, 1.1vw, 1.2rem);
  line-height: 1.6;
  opacity: 0.9;
}

.folder-shell {
  padding-top: 2.5rem;
  padding-bottom: 4rem;
}

.folder-cards {
  justify-content: center;
}

@media (max-width: 62rem) {
  .folder-hero__inner {
    padding: 1.75rem 0 2rem;
  }
}
</style>
