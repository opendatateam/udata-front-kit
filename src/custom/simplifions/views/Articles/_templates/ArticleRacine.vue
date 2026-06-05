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
// Différence par rapport à un article en dossier :
//  - imports en '../../' (pas '../../../')
//  - premier argument de buildSimplifionsArticlePageMeta = null (pas de themeMeta)
//  - pas de quatrième argument folderPathPrefix
import SimplifionsArticleLayout from '../../../components/article/SimplifionsArticleLayout.vue'
import ArticleSection from '../../../components/article/SimplifionsArticleSection.vue'
import { buildSimplifionsArticlePageMeta } from '../../../model/articles'
import { guidesMeta } from '../meta'

// --- Spotlight : mettre une solution ou un cas d'usage en avant avec un commentaire ---
// import SimplifionsArticleTopicSpotlight from '../../../components/article/SimplifionsArticleTopicSpotlight.vue'
//
// Dans le template (aucun import supplémentaire, aucun fetch à écrire) :
// <SimplifionsArticleTopicSpotlight :slugs="['mon-slug']" page-key="solutions">
//   <p>Mon commentaire éditorial, avec du <strong>gras</strong> ou des liens.</p>
//   <router-link class="fr-btn fr-btn--sm fr-btn--secondary" to="/solutions/mon-slug">
//     Voir la fiche complète
//   </router-link>
// </SimplifionsArticleTopicSpotlight>
//
// Plusieurs topics : :slugs="['slug-1', 'slug-2']"
// Pour un cas d'usage : page-key="cas-d-usages"
// Props optionnelles pour enrichir la carte (toutes à false par défaut) :
//   :show-description="true"  :show-image="true"  :show-target-users="true"
//   :show-fournisseurs="true"  :show-simplification-tags="true"  :show-categorie-de-solution="true"

// --- Grille de cartes par slug (solutions ou cas d'usages) ---
// import { useTopicsBySlug } from '../../../composables/useTopicsBySlug'
// import type { TopicSolution } from '../../../model/topics'
// import type { TopicCasUsage } from '../../../model/topics'
// import SimplifionsSolutionCard from '../../../components/SimplifionsSolutionCard.vue'
// import SimplifionsCasDusageCard from '../../../components/SimplifionsCasDusageCard.vue'
//
// const { topics: mesSolutions, loading: solutionsLoading } = useTopicsBySlug<TopicSolution>([
//   'slug-solution-1', 'slug-solution-2'
// ])
// const { topics: mesCasUsages, loading: casUsagesLoading } = useTopicsBySlug<TopicCasUsage>([
//   'slug-cas-usage-1'
// ])
//
// Dans le template :
// <div v-for="s in mesSolutions" :key="s.id">
//   <SimplifionsSolutionCard :topic="s" page-key="solutions" />
// </div>
// <div v-for="cu in mesCasUsages" :key="cu.id">
//   <SimplifionsCasDusageCard :topic="cu" page-key="cas-d-usages" />
// </div>

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  null,        // ← pas de dossier (themeMeta)
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }]
  // ← pas de folderPathPrefix (le 4e argument n'est pas nécessaire sans dossier)
)
</script>
