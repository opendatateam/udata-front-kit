<template>
  <SimplifionsArticleLayout
    :title="article.title"
    :lead="article.description"
    :hero-image-src="article.imageSrc"
    :hero-image-alt="article.imageAlt"
    :kicker="articleKicker"
    :article-tags="article.articleTags"
    :article-category="article.articleCategory"
    :show-no-development-badge="article.showNoDevelopmentBadge"
    :breadcrumb-links="breadcrumbLinks"
    :hero-backdrop-gradient="article.heroBackdropGradient"
    :hero-panel-background="article.heroPanelBackground"
    :sections="sections"
  >
    <div class="fr-callout fr-callout--beige-gris-galet">
      <h2 id="verifications" class="fr-callout__title">
        2 vérifications à faire
      </h2>
      <div class="fr-callout__text">
        <p class="fr-text--lead guide-section-lead">
          Pour s’assurer que votre collectivité utilise déjà bien les bases
          dont toute collectivité peut bénéficier, commencez par ces deux
          points.
        </p>

        <ul class="guide-bullets">
          <li>
            <b>
              Vérifier que vos agents connaissent bien les portails publics de
              consultation des données
            </b>
            <br />
            Gratuits, accessibles en quelques clics à tout agent public pour
            instruire les démarches.
            <br />
            <router-link
              class="fr-link"
              to="/solutions?categorie-de-solution=portail-consultation"
            >
              En savoir plus
            </router-link>
          </li>
          <li>
            <b>
              Prendre connaissance des données déjà disponibles via vos
              éditeurs de logiciels
            </b>
            <br />
            Vous utilisez déjà sûrement des données récupérées à la source via
            vos différents logiciels éditeurs, redécouvrez lesquelles en
            recherchant votre éditeur ici.
            <br />
            <router-link
              class="fr-link"
              to="/solutions?categorie-de-solution=logiciel-metier"
            >
              En savoir plus
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <h2 id="definition" class="fr-h2 fr-my-0w fr-mt-4w section-title">
      Simplifier une démarche en récupérant la donnée à la source : de quoi
      parle-t-on ?
    </h2>

    <p class="fr-text--lead guide-section-lead">
      Lorsqu’un usager, particulier, entreprise ou association complète une
      démarche administrative, il est souvent requis qu’il fournisse des
      informations le concernant, qu’il a le plus souvent déjà transmises.
    </p>

    <p class="guide-paragraph">
      Par exemple, lorsqu’un parent inscrit son enfant à la cantine, il peut
      avoir à transmettre son quotient familial ou son revenu fiscal de
      référence pour obtenir le tarif adéquat. Ces informations sont pourtant
      déjà connues de la CAF, de la MSA ou de la direction générale des
      finances publiques.
    </p>

    <div class="fr-mt-4w fr-p-2w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0">
        Sur le site Simplifions, ce qu’on entend par
        <strong>
          “Récupérer la donnée à la source pour simplifier une démarche”
        </strong>
        ou
        <strong>“récupérer les données utiles par démarche”</strong>, c’est
        aller chercher la donnée directement auprès de l’administration qui la
        possède pour éviter de la demander à l’usager.
      </p>
    </div>

    <div class="fr-mt-4w fr-p-2w fr-highlight fr-highlight--orange-terre-battue">
      <p class="fr-mb-0">
        Ce principe s’incarne dans l’obligation légale du
        <strong>Dites-le nous une fois</strong>, qui exige de l’administration
        qu’elle ne redemande plus une information déjà connue.
      </p>
    </div>

    <p class="guide-paragraph">
      Ce principe est souvent mieux connu et mis en place par les
      administrations ou les collectivités ayant des services innovation et
      une direction de l’informatique en mesure de récupérer et d’intégrer les
      données via les tuyaux informatiques proposés par les administrations
      fournisseurs de la donnée.
    </p>

    <p class="guide-paragraph">
      Pourtant, dans les petites collectivités, le Dites-le nous une fois, ou
      le fait de récupérer la donnée à la source pour ne pas la redemander aux
      usagers, est, pour certaines données :
    </p>

    <ul class="fr-list guide-list">
      <li>
        souvent déjà fonctionnel par le biais des éditeurs de logiciels qui
        sont déjà branchés à ces tuyaux informatiques et en font bénéficier
        leurs clients publics ;
      </li>
      <li>
        accessible sans ressources supplémentaires via l’utilisation, par vos
        agents, de sites en ligne qui permettent de consulter les données
        administratives des entreprises, des associations ou des particuliers.
      </li>
    </ul>

    <p class="guide-paragraph">
      L’objectif de simplifions.data.gouv.fr est de recenser les données
      accessibles et utiles par démarche administrative. Cela inclut les
      données brutes, mais aussi les sites de consultation utilisés par les
      agents et les logiciels métiers clés en main.
    </p>

    <h2 id="sites-consultation" class="fr-h2 fr-my-0w fr-mt-4w section-title">
      Les sites de consultation, aucun développement ni budget requis
    </h2>

    <p class="fr-text--lead guide-section-lead">
      La première chose à vérifier auprès de vos agents, c’est s’ils ont bien
      accès aux portails de consultation suivants.
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-4">
        <article class="fr-card guide-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <p class="guide-card__label">Particuliers</p>
              <h3 class="fr-card__title">CAF pro et formulaire QF</h3>
              <p class="fr-card__desc">
                De la CAF en général : CAF pro. Quotients familiaux CAF et MSA
                : le formulaire de collecte du QF.
              </p>
            </div>
          </div>
        </article>
      </div>

      <div class="fr-col-12 fr-col-lg-4">
        <article class="fr-card guide-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <p class="guide-card__label">Entreprises</p>
              <h3 class="fr-card__title">L’annuaire des entreprises</h3>
              <p class="fr-card__desc">
                Une porte d’entrée simple pour consulter les données utiles.
              </p>
            </div>
          </div>
        </article>
      </div>

      <div class="fr-col-12 fr-col-lg-4">
        <article class="fr-card guide-card">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <p class="guide-card__label">Associations</p>
              <h3 class="fr-card__title">Annuaire et Data Subventions</h3>
              <p class="fr-card__desc">
                Deux références utiles pour récupérer des données sans
                développement.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div class="fr-mt-4w fr-p-2w fr-highlight fr-highlight--blue-france">
      <p class="fr-mb-0">
        Tous ces sites sont accessibles aux agents publics, gratuitement, sous
        réserve d’une utilisation adaptée, dans le strict cadre de leurs
        missions.
      </p>
    </div>

    <p class="guide-paragraph">
      Ils permettent notamment de couvrir une partie des besoins de nombreux
      cas d’usages. Ce sont un premier pas pour récupérer les données. Vos
      agents peuvent les consulter en ligne, elles sont souvent tenues à jour
      le plus fréquemment possible. En revanche, la donnée n’est pas
      directement déposée dans les outils métiers des agents. C’est à eux de
      se rendre sur le site et de copier, coller ou télécharger les
      informations nécessaires pour instruire les démarches.
    </p>

    <h2 id="logiciels-editeurs" class="fr-h2 fr-my-0w fr-mt-4w section-title">
      Les logiciels éditeurs : découvrez les données auxquelles vous avez déjà
      accès
    </h2>

    <p class="guide-paragraph">
      Simplifions.data.gouv.fr référence les logiciels métiers clés en main
      raccordés aux données utiles pour chaque démarche. Ainsi, vous pouvez,
      depuis la page solution de chaque logiciel, vérifier les données
      auxquelles il est raccordé.
    </p>

    <p class="guide-paragraph">
      Cette liste se trouve en bas de la page dans la partie concernée. Elle
      n’est pas exhaustive et vise à être complétée. Elle concerne
      principalement l’intégration des données fournies par le biais de deux
      API spécialisées pour la simplification des démarches : l’API Particulier
      et l’API Entreprise, qui distribuent respectivement de nombreuses données
      des particuliers ou des entreprises et associations.
    </p>

    <p class="guide-paragraph">
      Il est également possible de consulter la liste des logiciels ayant
      intégré les données de l’API Particulier et de l’API Entreprise et de
      savoir, pour chacun d’entre eux, précisément le nombre de données utiles
      et disponibles par cas d’usage.
    </p>

    <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
      <div class="fr-col-12 fr-col-md-6">
        <router-link
          class="fr-btn fr-btn--secondary fr-btn--lg fr-btn--icon-right fr-icon-arrow-right-line"
          to="/solutions?categorie-de-solution=logiciel-metier"
        >
          Rechercher un éditeur
        </router-link>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <router-link
          class="fr-btn fr-btn--lg fr-btn--icon-right fr-icon-arrow-right-line"
          to="/cas-d-usages"
        >
          Voir les cas d’usages
        </router-link>
      </div>
    </div>

    <h2 id="cta" class="fr-h2 fr-my-0w fr-mt-4w section-title">
      Vous vous intéressez à une intégration directe par API ou par base de
      données ?
    </h2>

    <p class="fr-text--lead guide-section-lead">
      Si votre collectivité veut aller plus loin, la prochaine étape est de
      regarder les solutions raccordées aux données ou les cas d’usages qui
      reposent sur une intégration technique directe.
    </p>

    <p class="guide-paragraph">
      Vous pouvez commencer par explorer les solutions techniques et les cas
      d’usages déjà référencés sur simplifions.data.gouv.fr, puis identifier le
      chemin le plus simple pour votre collectivité.
    </p>

    <h2 id="checklist" class="fr-h2 fr-my-0w fr-mt-4w section-title">
      Checklist de départ
    </h2>

    <p class="fr-text--lead guide-section-lead">
      Avant d’aller plus loin, vérifiez ces points dans votre collectivité.
    </p>

    <fieldset class="fr-fieldset guide-checkboxes">
      <legend class="fr-fieldset__legend fr-fieldset__legend--regular">
        Checklist de départ
      </legend>
      <div
        v-for="item in checklistOptions"
        :key="item.value"
        class="fr-fieldset__element"
      >
        <div class="fr-checkbox-group">
          <input
            :id="`checklist-${item.value}`"
            type="checkbox"
            checked
            disabled
          />
          <label class="fr-label" :for="`checklist-${item.value}`">
            {{ item.label }}
          </label>
        </div>
      </div>
    </fieldset>
  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'guide-base-petites-collectivites',
  title: 'Guide de base pour les petites collectivités',
  description:
    'Récupérer les données de vos usagers pour éviter de leur redemander lors de leurs démarches administratives, c’est aussi possible pour les petites collectivités.',
  slug: 'guide-base-petites-collectivites',
  imageSrc: '/static/simplifions/assets/portail_famille.jpg',
  imageAlt: 'Portail famille',
  articleTags: [{ label: 'Petites communes' }, { label: 'Maires' }],
  articleCategory: 'guide',
  showNoDevelopmentBadge: true,
  heroBackdropGradient: 'linear-gradient(135deg, #34BAB5 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
} as const
</script>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../components/SimplifionsArticleLayout.vue'
import { buildSimplifionsArticlePageMeta } from '../../model/articles'
import { themeMeta } from './index'

const { article, articleKicker, breadcrumbLinks } =
  buildSimplifionsArticlePageMeta(
  themeMeta,
  articleMeta
)

const sections = [
  { id: 'verifications', label: '2 vérifications à faire' },
  { id: 'definition', label: 'De quoi parle-t-on ?' },
  { id: 'sites-consultation', label: 'Les sites de consultation' },
  { id: 'logiciels-editeurs', label: 'Les logiciels éditeurs' },
  { id: 'cta', label: 'Intégration directe' },
  { id: 'checklist', label: 'Checklist de départ' }
]

const checklistOptions = [
  {
    value: 'besoin',
    label: 'Le besoin métier est clairement identifié.'
  },
  {
    value: 'portails',
    label: 'Vos agents connaissent les portails publics de consultation utiles.'
  },
  {
    value: 'editeurs',
    label: 'Vous avez identifié les données déjà disponibles via vos éditeurs.'
  },
  {
    value: 'perimetre',
    label: 'Le premier périmètre reste limité et réaliste.'
  },
  {
    value: 'mode',
    label:
      'Vous savez si vous partez d’un site de consultation, d’un logiciel éditeur, ou d’une intégration directe.'
  }
]
</script>

<style scoped>
.section-title {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}

.guide-section-lead {
  max-width: 68ch;
}

.guide-paragraph {
  max-width: 72ch;
}

.guide-card {
  height: 100%;
  background: #fafafa;
}

.guide-card__label {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #5f6358;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.guide-list {
  padding-left: 1.25rem;
  max-width: 72ch;
}

.guide-list li + li {
  margin-top: 0.5rem;
}

.guide-bullets {
  padding-left: 1.25rem;
  max-width: 72ch;
}

.guide-bullets li + li {
  margin-top: 1rem;
}

.guide-checkboxes {
  max-width: 74ch;
}
</style>
