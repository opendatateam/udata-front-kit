<template>
  <SimplifionsArticleLayout
    :h1="article.h1"
    :title="article.title"
    :lead="article.description"
    :kicker="articleKicker"
    :article-tags="article.articleTags"
    :article-category="article.articleCategory"
    :show-no-development-badge="article.showNoDevelopmentBadge"
    :breadcrumb-links="breadcrumbLinks"
    :hero-backdrop-gradient="article.heroBackdropGradient"
    :hero-panel-background="article.heroPanelBackground"
  >
    <ArticleSection id="premiere-section" label="Première section">
      <p class="fr-text--lead">Phrase d'introduction de la section.</p>
      <p>Contenu de la section.</p>
    </ArticleSection>

    <ArticleSection id="deuxieme-section" label="Deuxième section">
      <!-- Slot #heading : à utiliser si le titre dans l'article est plus long que le label du sommaire -->
      <!-- <template #heading>Titre long de la deuxième section</template> -->
      <p>Contenu de la deuxième section.</p>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'mon-article',                       // → URL : /guides/mon-article
  h1: "Titre de l'article",
  // title: 'Titre SEO (optionnel, fallback sur h1)',
  description: 'Résumé affiché dans la carte et le bandeau hero.',

  heroBackdropGradient: 'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)',

  // --- Optionnel ---
  // imageSrc: '/static/simplifions/assets/mon-image.jpg',
  // articleCategory: 'guide' as const,   // 'guide' | 'liste' | 'palmares' | 'veille'
  // showNoDevelopmentBadge: true,
  // articleTags: [{ label: 'Mon public' }, { label: 'Autre public', href: '/solutions?audience=xxx' }]
} as const
</script>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../components/SimplifionsArticleLayout.vue'
import ArticleSection from '../../components/SimplifionsArticleSection.vue'
import { buildSimplifionsArticlePageMeta } from '../../model/articles'
import { guidesMeta } from './meta'

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  null,
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }]
)
</script>
