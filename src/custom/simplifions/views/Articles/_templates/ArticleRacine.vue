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

      <!-- CALLOUT BORDURE VERTE
           Encadré informatif mis en avant. Aucun import requis.
      <div class="fr-callout fr-callout--green-menthe fr-my-4w">
        <p class="fr-callout__title">Titre optionnel</p>
        <p class="fr-callout__text">
          Texte du callout. Met en avant une information importante ou un point clé.
        </p>
      </div>
      -->

      <!-- SPOTLIGHT — 1 SLUG
           Carte solution ou cas d'usage + commentaire côte à côte.
           Import requis : SimplifionsArticleTopicSpotlight (voir script ci-dessous)
      <SimplifionsArticleTopicSpotlight :slugs="['mon-slug']" page-key="solutions">
        <p>Commentaire éditorial sur cette solution.</p>
        <router-link class="fr-btn fr-btn--sm fr-btn--secondary" to="/solutions/mon-slug">
          Voir la fiche complète
        </router-link>
      </SimplifionsArticleTopicSpotlight>
      -->

      <!-- SPOTLIGHT — 3 SLUGS
           Commentaire en haut, trois cartes en grille en dessous.
           Import requis : SimplifionsArticleTopicSpotlight (voir script ci-dessous)
      <SimplifionsArticleTopicSpotlight
        :slugs="['slug-1', 'slug-2', 'slug-3']"
        page-key="solutions"
      >
        <p>Commentaire s'appliquant aux trois solutions présentées ci-dessous.</p>
      </SimplifionsArticleTopicSpotlight>
      -->
    </ArticleSection>

    <ArticleSection id="deuxieme-section" label="Deuxième section">
      <!-- Slot #heading : à utiliser si le titre dans l'article est plus long que le label du sommaire -->
      <!-- <template #heading>Titre long de la deuxième section</template> -->
      <p>Contenu de la deuxième section.</p>

      <!-- CHECKLIST
           Liste de points à cocher, fond beige, icône verte. Aucun import requis.
      <SimplifionsArticleChecklist>
        <li>Premier point à vérifier.</li>
        <li>
          Deuxième point avec un
          <router-link class="fr-link" to="/solutions/mon-slug">lien interne</router-link>.
        </li>
        <li>Troisième point.</li>
      </SimplifionsArticleChecklist>
      -->

      <!-- BOUTON CENTRÉ
           Bouton d'appel à l'action centré. Aucun import requis.
      <div class="fr-grid-row fr-grid-row--center fr-mt-3w">
        <router-link
          class="fr-btn fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
          to="/ma-page"
        >
          Texte du bouton
        </router-link>
      </div>
      -->

      <!-- GRILLE DE CARTES — SOLUTIONS
           Grille 3 colonnes avec skeleton pendant le chargement.
           Imports et composables requis : voir script ci-dessous (variante solutions).
      <div class="fr-grid-row fr-grid-row--gutters">
        <template v-if="solutionsLoading">
          <div v-for="n in 3" :key="n" class="fr-col-12 fr-col-lg-4">
            <div class="fr-card guide-card-skeleton" aria-hidden="true" />
          </div>
        </template>
        <template v-else>
          <div v-for="solution in mesSolutions" :key="solution.id" class="fr-col-12 fr-col-lg-4">
            <SimplifionsSolutionCard
              :topic="solution"
              page-key="solutions"
              :show-description="false"
              :show-fournisseurs="false"
              :show-simplification-tags="false"
            />
          </div>
        </template>
      </div>
      -->

      <!-- GRILLE DE CARTES — CAS D'USAGES
           Même pattern, variante pour les cas d'usages.
           Imports et composables requis : voir script ci-dessous (variante cas d'usages).
      <div class="fr-grid-row fr-grid-row--gutters">
        <template v-if="casUsagesLoading">
          <div v-for="n in 3" :key="n" class="fr-col-12 fr-col-lg-4">
            <div class="fr-card guide-card-skeleton" aria-hidden="true" />
          </div>
        </template>
        <template v-else>
          <div v-for="cu in mesCasUsages" :key="cu.id" class="fr-col-12 fr-col-lg-4">
            <SimplifionsCasDusageCard
              :topic="cu"
              page-key="cas-d-usages"
              :show-description="false"
              :show-fournisseurs="false"
              :show-simplification-tags="false"
            />
          </div>
        </template>
      </div>
      -->
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

// --- Imports optionnels selon les composants utilisés ---
// import SimplifionsArticleTopicSpotlight from '../../../components/article/SimplifionsArticleTopicSpotlight.vue'
// import SimplifionsArticleChecklist from '../../../components/article/SimplifionsArticleChecklist.vue'
//
// Props optionnelles du Spotlight (valeurs par défaut entre parenthèses) :
//   :show-description="true"      (false) affiche la description
//   :show-image="false"           (true)  cache l'image
//   :show-operateur-tag="true"    (true)  badge fournisseur — s'affiche dans le body si show-image=false
//   :show-target-users="true"     (false) tags "à destination de"
//   :show-fournisseurs="true"     (false) tags fournisseurs de données
//   :show-simplification-tags="true" (false) tags de simplification
//   :show-categorie-de-solution="true" (false) catégorie de solution

// --- Grille de cartes par slug — SOLUTIONS ---
// import { useTopicsBySlug } from '../../../composables/useTopicsBySlug'
// import type { TopicSolution } from '../../../model/topics'
// import SimplifionsSolutionCard from '../../../components/SimplifionsSolutionCard.vue'
//
// const { topics: mesSolutions, loading: solutionsLoading } = useTopicsBySlug<TopicSolution>([
//   'slug-solution-1', 'slug-solution-2', 'slug-solution-3'
// ])
//
// --- Grille de cartes par slug — CAS D'USAGES ---
// import type { TopicCasUsage } from '../../../model/topics'
// import SimplifionsCasDusageCard from '../../../components/SimplifionsCasDusageCard.vue'
//
// const { topics: mesCasUsages, loading: casUsagesLoading } = useTopicsBySlug<TopicCasUsage>([
//   'slug-cas-usage-1', 'slug-cas-usage-2'
// ])
//
// Le skeleton (placeholder gris animé) s'affiche pendant le chargement.
// Ajuster le "3" dans v-for="n in 3" selon le nombre de slugs attendus.
//
// Style skeleton requis dans <style scoped> :
// .guide-card-skeleton {
//   height: 200px;
//   background: var(--background-alt-grey);
//   border-radius: 4px;
//   animation: pulse 1.5s ease-in-out infinite;
// }
// @keyframes pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  null,        // ← pas de dossier (themeMeta)
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }]
  // ← pas de folderPathPrefix (le 4e argument n'est pas nécessaire sans dossier)
)
</script>
