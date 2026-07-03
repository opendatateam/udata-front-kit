<template>
  <SimplifionsArticleLayout
    :h1="article.h1"
    :title="article.title"
    :lead="article.description"
    :kicker="articleKicker"
    :breadcrumb-links="breadcrumbLinks"
    :hero-backdrop-gradient="article.heroBackdropGradient"
    :hero-panel-background="article.heroPanelBackground"
  >

    <ArticleSection id="principe" label="Le principe">

      <p class="fr-text--lead">
        Le <strong>«&nbsp;Dites-le nous une fois&nbsp;»</strong> (DLNUF) est un principe juridique
        qui interdit à une administration de demander à un usager — particulier, entreprise
        ou association — une information qu'elle détient déjà ou qu'une autre administration
        détient et peut lui communiquer.
      </p>

      <p>
        L'idée est simple&nbsp;: si l'administration au sens large sait déjà qu'une personne est étudiante — <i>information connue des établissements</i> ― ou qu'une
        entreprise est immatriculée ― <i>information suivie dans un répertoire public</i> ―, elle ne devrait pas demander à cet étudiant de prouver son statut ou à cette entreprise de justifier son existence.<br><br>
        Plutôt que d'être redemandée à l'usager, la donnée doit circuler entre les administrations ―<i> ici entre l'administration qui gère la démarche et l'établissement d'enseignement supérieur ou le répertoire</i>.
      </p>

      <div class="fr-my-4w fr-highlight fr-highlight--blue-france">
        <p class="fr-mb-0">
          Ce principe est codifié aux
          <a class="fr-link" href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000031366350/LEGISCTA000031367410/#LEGISCTA000031367410">articles L.&nbsp;114-8 à L.&nbsp;114-10 du Code des relations
          entre le public et l'administration (CRPA)</a>.
          Il s'applique à l'ensemble des administrations de l'État, des collectivités
          territoriales et de leurs établissements publics.
        </p>
      </div>

      <SimplifionsArticleTopicSpotlight
        :slugs="['bouquet-api-entreprise', 'bouquet-api-particulier', 'api-impot-particulier' ]"
        page-key="solutions" :show-image="false" :show-categorie-de-solution="true" :show-arrow="true"
      >
        <p>
          En pratique, sa mise en œuvre repose sur des échanges de données entre
          administrations via des API (interfaces de programmation) ou des accès sécurisés
          à des bases de données publiques. C'est précisément l'objet d'API telles qu'<b>API Particulier, API Entreprise</b> et <b>API Impôt particulier</b> référencées sur ce site.
        </p>
      </SimplifionsArticleTopicSpotlight>

    </ArticleSection>

    <ArticleSection id="textes-chronologie" label="Textes et chronologie">
      <template #heading>Textes juridiques et chronologie</template>

      <p class="fr-text--lead">
        Le DLNUF est le fruit d'une sédimentation législative progressive, à la fois
        nationale et européenne. Les textes fondateurs sont intégrés dans la chronologie ci-dessous.
      </p>

   

      <SimplifionsArticleTimeline>

        <li>
          <time datetime="2016">2016</time>
          <span class="timeline-tag timeline-tag--eu">Titre court</span>
          <p>
            <strong>Titre long dispositif UE</strong>
            lorem ipsum
          </p>
          <a
            href="lien"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Lorem Ipsum<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>


        <li>
          <time datetime="2016">2016</time>
          <span class="timeline-tag">Titre court</span>
          <p>
            <strong>Titre long dispositif France</strong>
            lorem ipsum
          </p>
          <a
            href="lien"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Lorem Ipsum<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>
       
      </SimplifionsArticleTimeline>

    </ArticleSection>

    <ArticleSection id="publications" label="Publications institutionnelles">
      <template #heading>Publications et rapports de référence</template>

      <p class="fr-text--lead">
        Plusieurs institutions ont publié des analyses, rapports et guides sur la mise en
        œuvre du DLNUF en France.
      </p>

      <ul class="source-list" role="list">

        <li class="source-item">
          <div class="source-meta">
            <span class="source-tag source-tag--rapport">Obervatoire</span>
          </div>
          <p class="source-title fr-mb-0">
            <strong>DINUM — Observatoire de la qualité des démarches en ligne</strong>
          </p>
          <p class="source-desc">
            La Direction interministérielle du numérique effectue un suivi trimestriel de la qualité des démarches essentielles. Le Dites-le-nous une fois fait partie des critères retenus pour évaluer les démarches.
          </p>
          <a
            href="https://observatoire.numerique.gouv.fr/observatoire"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
           Observatoire de la qualité des démarches en ligne<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>


        <li class="source-item">
          <div class="source-meta">
            <span class="source-tag source-tag--eu">Publication UE</span>
          </div>
          <p class="source-title fr-mb-0">
            <strong>Commission européenne — Once Only Principle</strong>
          </p>
          <p class="source-desc">
            La Commission européenne documente le principe «&nbsp;once only&nbsp;» et son
            déploiement dans les États membres dans le cadre du programme ISA² et du portail
            numérique unique.
          </p>
          <a
            href="https://interoperable-europe.ec.europa.eu/collection/digital-building-blocks/solution/once-only-technical-system-oots"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Once Only Technical System — Interoperable Europe<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

      </ul>

      <div class="fr-mt-4w fr-callout fr-callout--beige-gris-galet">
        <div class="fr-callout__text">
          <p class="fr-mb-0">
            <strong>Cette liste est non exhaustive.</strong>
            Si vous connaissez une publication ou un texte juridique non référencé ici,
            n'hésitez pas à nous le signaler pour enrichir cette veille.
          </p>
        </div>
      </div>

    </ArticleSection>

  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'chronologie-juridique-dlnuf',
  h1: 'Chronologie juridique du « Dites-le nous une fois »',
  title: 'Dites-le nous une fois : principe, textes juridiques et chronologie',
  description:
    `Veille juridique et institutionnelle du principe "Dites-le nous une fois" : textes de loi, décrets, règlements européens et chronologie des évolutions depuis 2011.`,
  articleCategory: 'veille' as const,
  heroBackdropGradient: 'linear-gradient(135deg, #dee5fd 0%, #f7ebe5 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
} as const
</script>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../components/article/SimplifionsArticleLayout.vue'
import SimplifionsArticleTimeline from '../../components/article/SimplifionsArticleTimeline.vue'
import ArticleSection from '../../components/article/SimplifionsArticleSection.vue'
import SimplifionsArticleTopicSpotlight from '../../components/article/SimplifionsArticleTopicSpotlight.vue'
import { buildSimplifionsArticlePageMeta } from '../../model/articles'
import { guidesMeta } from './meta'

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  null,
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }]
)
</script>

<style scoped>
.source-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.source-item {
  padding: 1.25rem 1.5rem;
  background: var(--background-alt-grey);
  border-radius: 4px;
  border-left: 4px solid var(--border-default-blue-france);
}

.source-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.source-tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-inverted-blue-france);
  background-color: var(--background-action-high-blue-france);
  padding: 0.1rem 0.5rem;
  border-radius: 2px;
}

.source-tag--eu {
  background-color: var(--background-action-high-purple-glycine);
}

.source-tag--rapport {
  color: var(--text-default-grey);
  background-color: var(--background-alt-beige-gris-galet);
  border: 1px solid var(--border-default-grey);
}

.source-date {
  font-size: 0.8rem;
  color: var(--text-mention-grey);
}

.source-title {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 0.4rem !important;
}

.source-desc {
  font-size: 0.9rem;
  color: var(--text-default-grey);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}
</style>
