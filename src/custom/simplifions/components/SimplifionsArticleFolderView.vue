<template>
  <div class="article-folder-page">
    <header class="article-folder-hero">
      <div class="article-folder-hero__backdrop"></div>

      <div class="fr-container article-folder-hero__inner">
        <div class="article-folder-hero__panel">
          <p class="article-folder-hero__eyebrow">{{ eyebrow }}</p>
          <h1 class="article-folder-hero__title">{{ title }}</h1>
          <p v-if="lead" class="article-folder-hero__lead">
            {{ lead }}
          </p>
        </div>
      </div>
    </header>

    <div class="fr-container article-folder-shell">
      <div v-if="articles.length" class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="article in articles"
          :key="article.to"
          class="fr-col-12 fr-col-md-6"
        >
          <router-link class="fr-card fr-enlarge-link folder-card" :to="article.to">
            <div class="fr-card__body">
              <div class="fr-card__content">
                <p v-if="article.badge" class="folder-card__badge">
                  {{ article.badge }}
                </p>
                <h2 class="fr-card__title">{{ article.title }}</h2>
                <p v-if="article.description" class="fr-card__desc">
                  {{ article.description }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ArticleLink = {
  title: string
  to: string
  description?: string
  badge?: string
}

withDefaults(
  defineProps<{
    title: string
    lead?: string
    eyebrow?: string
    articles: readonly ArticleLink[]
  }>(),
  {
    eyebrow: 'Dossier'
  }
)
</script>

<style scoped>
.article-folder-page {
  --article-folder-panel-bg: var(--background-alt-beige-gris-galet);
}

.article-folder-hero {
  position: relative;
  overflow: hidden;
  min-height: clamp(14rem, 20vw, 18rem);
  color: #fff;
}

.article-folder-hero__backdrop {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%);
}

.article-folder-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  min-height: inherit;
  padding-top: clamp(5rem, 8vw, 7rem);
  padding-bottom: 1rem;
}

.article-folder-hero__panel {
  width: min(75%, 64rem);
  padding: 1.5rem 1.75rem 1.75rem;
  color: var(--text-title-grey);
  background-color: var(--article-folder-panel-bg);
}

.article-folder-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  margin: 0 0 0.875rem;
  padding: 0.3rem 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-title-blue-france);
  background-color: var(--background-default-grey);
  border-radius: 999px;
}

.article-folder-hero__title {
  margin: 0;
  font-size: clamp(2rem, 3.8vw, 3.4rem);
  line-height: 1.05;
}

.article-folder-hero__lead {
  margin: 1rem 0 0;
  max-width: 68ch;
  font-size: clamp(1.05rem, 1.1vw, 1.2rem);
  line-height: 1.65;
  color: var(--text-default-grey);
}

.article-folder-shell {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.folder-card {
  display: block;
  height: 100%;
  text-decoration: none;
  background: #fafafa;
}

.folder-card__badge {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5f6358;
}

@media (max-width: 62rem) {
  .article-folder-hero__inner {
    padding-top: 4.5rem;
  }

  .article-folder-hero__panel {
    width: 100%;
    padding: 1.1rem 1.1rem 1.25rem;
  }
}

@media (min-width: 90rem) {
  .article-folder-hero__panel {
    width: min(66.666%, 58rem);
  }
}
</style>
