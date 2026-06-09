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

<!--         <li>
          <time datetime="2013">2013</time>
          <span class="timeline-tag">Choc de simplification</span>
          <p>
            Lancement du <strong>«&nbsp;choc de simplification&nbsp;»</strong>.
            Création du Conseil de la simplification pour les entreprises. La simplification
            administrative devient un chantier politique central.
          </p>
        </li> -->

        <li>
          <time datetime="2016">2016</time>
          <span class="timeline-tag timeline-tag--eu">Plan UE</span>
          <p>
            Le <strong>Plan d'action européen pour l'administration en ligne 2016-2020</strong>
            inscrit le principe «&nbsp;once only&nbsp;» parmi les sept principes fondateurs de
            l'e-gouvernement européen.
          </p>
          <a
            href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=COM:2016:179:FIN"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Lire le plan sur EUR-Lex<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li>
          <time datetime="2017">2017</time>
          <span class="timeline-tag">Plan AP2022</span>
          <p>
            Lancement du programme <strong>Action Publique 2022</strong>. La simplification
            des démarches pour les usagers et la circulation des données entre administrations
            deviennent des objectifs de transformation publique prioritaires.
          </p>
        </li>

        <li>
          <time datetime="2018-08-10">2018</time>
          <span class="timeline-tag">Loi</span>
          <p>
            <strong>Loi n°&nbsp;2018-727 du 10 août 2018 (ESSOC)</strong> — Article 40.
            Première inscription formelle du DLNUF dans le droit français.
            Modifie le CRPA en créant les articles L.&nbsp;114-8 à L.&nbsp;114-10.
          </p>
          <a
            href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000037307624"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Texte de la loi sur Légifrance<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li>
          <time datetime="2018-10-02">2018</time>
          <span class="timeline-tag timeline-tag--eu">Règlement UE</span>
          <p>
            <strong>Règlement (UE) 2018/1724</strong> sur le portail numérique unique (SDG).
            Instaure le principe «&nbsp;once only&nbsp;» à l'échelle européenne.
            L'article 14 organise le système technique transfrontalier d'échange de preuves.
          </p>
          <a
            href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32018R1724"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Règlement sur EUR-Lex<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li>
          <time datetime="2021-04-16">2021</time>
          <span class="timeline-tag">Décret</span>
          <p>
            <strong>Décret n°&nbsp;2021-464 du 16 avril 2021</strong> — Étend la liste des
            informations échangeables entre administrations&nbsp;: revenus, diplômes, situation
            familiale, demandeurs d'emploi.
          </p>
          <a
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043388527"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Décret sur Légifrance<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li>
          <time datetime="2023">2023</time>
          <span class="timeline-tag timeline-tag--eu">Once Only UE</span>
          <p>
            Entrée en vigueur du système technique transfrontalier du portail numérique unique
            (SDG). Les usagers européens peuvent ne fournir leurs justificatifs qu'une seule
            fois pour des démarches dans plusieurs États membres.
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
            <span class="source-tag source-tag--rapport">Rapport</span>
          </div>
          <p class="source-title fr-mb-0">
            <strong>DITP — Baromètre de la qualité des services publics</strong>
          </p>
          <p class="source-desc">
            La Direction interministérielle de la transformation publique publie chaque année
            un baromètre mesurant l'avancement de la simplification des démarches,
            dont la mise en œuvre du DLNUF.
          </p>
          <a
            href="https://www.modernisation.gouv.fr/outils-et-methodes-pour-transformer/le-barometre-des-services-publics"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Baromètre DITP<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li class="source-item">
          <div class="source-meta">
            <span class="source-tag source-tag--rapport">Étude annuelle</span>
            <span class="source-date">2014</span>
          </div>
          <p class="source-title fr-mb-0">
            <strong>Conseil d'État — Le numérique et les droits fondamentaux</strong>
          </p>
          <p class="source-desc">
            Étude annuelle 2014 du Conseil d'État. Analyse les enjeux juridiques de la
            donnée publique, de la circulation de l'information entre administrations
            et des droits fondamentaux à l'ère numérique.
          </p>
          <a
            href="https://www.conseil-etat.fr/publications-colloques/etudes/etudes-annuelles/le-numerique-et-les-droits-fondamentaux"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Étude du Conseil d'État<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
          </a>
        </li>

        <li class="source-item">
          <div class="source-meta">
            <span class="source-tag source-tag--rapport">Catalogue</span>
          </div>
          <p class="source-title fr-mb-0">
            <strong>api.gouv.fr — Catalogue des API publiques</strong>
          </p>
          <p class="source-desc">
            Le catalogue recense les API de l'État utilisables pour mettre en œuvre le DLNUF,
            dont l'API Particulier (données des particuliers) et l'API Entreprise
            (données des entreprises et associations).
          </p>
          <a
            href="https://api.gouv.fr/rechercher-api"
            target="_blank"
            rel="noopener noreferrer"
            class="fr-link fr-link--icon-right fr-icon-external-link-line"
          >
            Catalogue api.gouv.fr<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
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
