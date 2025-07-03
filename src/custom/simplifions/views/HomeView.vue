<script setup lang="ts">
import SubSectionButtons from '@/components/sections/SubSectionButtons.vue'
import SubSectionCards from '@/components/sections/SubSectionCards.vue'
import SubSectionDatasets from '@/components/sections/SubSectionDatasets.vue'
import SubSectionTiles from '@/components/sections/SubSectionTiles.vue'
import config from '@/config'
import { fromMarkdown } from '@/utils'

const sectionsHomePage = config.website.homepage.sections
const colorsBanner = config.website.home_banner_colors

const fournisseursDeService = [
  {
    title: 'Particuliers',
    emoji: '👱',
    href: '/cas-d-usages?tags=simplifions-users-particuliers',
    description: "Tous les cas d'usages concernant les particuliers"
  },
  {
    title: 'Entreprises',
    emoji: '💼',
    href: '/cas-d-usages?tags=simplifions-users-entreprises',
    description: "Tous les cas d'usages concernant les entreprises"
  },
  {
    title: 'Associations',
    emoji: '🤝',
    href: '/cas-d-usages?tags=simplifions-users-associations',
    description: "Tous les cas d'usages concernant les associations"
  },
  {
    title: 'Agents publics',
    emoji: '🧑‍💼',
    href: '/cas-d-usages?tags=simplifions-users-agents-publics',
    description: "Tous les cas d'usages concernant les agents publics"
  }
]

const niveauxDeSimplification = [
  {
    title: "Vous n'avez ni équipe technique, ni éditeur",
    description:
      "Les cas d'usage accessibles avec des solutions clés en main, faciles à mettre en place par un agent non technique.",
    casUsagesTags: 'simplifions-budget-aucun-developpement',
    solutionsTags: 'simplifions-solutions-moyens-aucun',
    imageSrc: '/simplifions/assets/accueil-picto-contract.png'
  },
  {
    title: 'Vous passez par un éditeur',
    description:
      "Les cas d'usages et solutions portés par des éditeurs qui s'occupent de l'intégration.",
    casUsagesTags: 'simplifions-budget-solution-editeur',
    solutionsTags: 'simplifions-solutions-moyens-editeur',
    imageSrc: '/simplifions/assets/accueil-picto-self-training.png'
  },
  {
    title: 'Vous avez votre service informatique',
    description:
      "Les cas d'usages et solutions que vos services informatiques peuvent intégrer dans vos démarches et/ou votre système d'information.",
    casUsagesTags: 'spf-budget-aucun-developpement',
    solutionsTags: 'spf-budget-aucun-developpement,spf-moyens-aucun',
    imageSrc: '/simplifions/assets/accueil-picto-coding.png'
  }
]
</script>

<template>
  <div
    class="banner"
    :style="
      'background: linear-gradient(0.25turn, ' +
      colorsBanner[0] +
      ', ' +
      colorsBanner[1] +
      ', ' +
      colorsBanner[2] +
      ');'
    "
  >
    <div class="fr-container">
      <h1 class="main-title fr-mb-3v">
        Acteurs publics, utilisez la donnée pour simplifier vos services !
      </h1>
      <div class="fr-mt-5w">
        <div class="subtitle fr-text--alt fr-mb-10w">
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-content-media__img fr-col-lg-2 fr-col-4">
              <img
                class="fr-responsive-img"
                src="/simplifions/assets/accueil-picto-ecosystem.png"
                alt=""
                style="display: block; width: 100%; height: auto"
              />
            </div>
            <div
              class="fr-col-lg-8 fr-col-12"
              style="
                font-family: Marianne, arial, sans-serif !important;
                font-style: normal;
              "
            >
              <p class="fr-text--lead">
                Simplifiez les démarches et services des citoyens, entreprises
                et associations en récupérant pour eux leurs informations
                administratives grâce aux API et aux données ! Vous gagnerez
                aussi du temps !
              </p>

              <a
                class="fr-btn fr-mt-1v fr-mr-2w fr fr-btn--lg"
                href="/cas-d-usages"
                >Tous les cas d'usages</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container hero-text">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Améliorer les services à destination :
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Le portail <i>simplifions.data.gouv.fr</i> vous accompagne pour
      simplifier, avec de la donnée, les démarches des citoyens.<br />Retrouvez
      tous les cas d'usages selon le public concerné :
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        class="fr-col-12 fr-col-lg-3"
        v-for="item in fournisseursDeService"
        :key="item.title"
      >
        <div
          class="fr-tile fr-tile--horizontal fr-enlarge-link"
          id="tile-sourcing"
        >
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h3 class="fr-tile__title fr-h3">
                <a :href="item.href">{{ item.title }}<br />{{ item.emoji }}</a>
              </h3>
              <p class="fr-tile__detail fr-h6">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-mt-4w fr-col-md-12 datagouv-components">
      <SubSectionButtons
        :subsection="[
          {
            name: 'Tous les cas d\'usages',
            url: 'cas-d-usages',
            class:
              'fr-btn fr-btn--icon-left fr-btn--lg fr-icon-checkbox-circle-fill'
          }
        ]"
      />
    </div>
  </div>

  <div class="fr-container hero-text">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Quelques soient vos ressources, il existe des solutions !
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Ce portail s'adresse à l'ensemble des acteurs publics, qu'ils disposent ou
      non de ressources informatiques.
      <br />
      Filtrez les cas d'usages et les solutions selon vos possibilités
      d'intégration :
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        class="fr-col-12 fr-col-lg-4"
        v-for="niveau in niveauxDeSimplification"
        :key="niveau.title"
      >
        <div class="fr-card" style="background-color: #fafafa">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                {{ niveau.title }}
              </h3>
              <p class="fr-card__desc">{{ niveau.description }}</p>
            </div>
            <div class="fr-card__footer">
              <ul
                class="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg"
              >
                <li>
                  <a
                    class="fr-btn"
                    :href="`/cas-d-usages?tags=${niveau.casUsagesTags}`"
                    >Cas d'usages</a
                  >
                </li>
                <li>
                  <a
                    class="fr-btn fr-btn--secondary"
                    :href="`/solutions?tags=${niveau.solutionsTags}`"
                    >Solutions</a
                  >
                </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100px;
                overflow: hidden;
                margin-top: 10px;
              "
            >
              <img
                class="fr-responsive-img"
                :src="niveau.imageSrc"
                alt=""
                style="max-height: 100%; width: auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-for="item in sectionsHomePage" :key="item">
    <div class="fr-container hero-text">
      <h4 v-if="item.title">{{ item.title }}</h4>
      <span v-html="fromMarkdown(item.content)"></span>
      <div class="fr-mt-4w fr-col-md-12 datagouv-components">
        <SubSectionDatasets
          v-if="item.sub_section_datasets"
          :subsection="item.sub_section_datasets"
        />
        <SubSectionCards
          v-if="item.sub_section_cards"
          :subsection="item.sub_section_cards"
        />
        <SubSectionTiles
          v-if="item.sub_section_tiles"
          :subsection="item.sub_section_tiles"
        />
        <SubSectionButtons
          v-if="item.sub_section_buttons"
          :subsection="item.sub_section_buttons"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-container {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.banner {
  padding-top: 5%;
  padding-bottom: 5%;
  position: relative;
}
.main-title {
  text-align: left;
  font-size: 48px;
  line-height: 50px;
  font-weight: 800;
}
.subtitle {
  text-align: left;
  font-style: italic;
  font-size: 20px;
  line-height: 28px;
}
.hero-text {
  margin-top: 30px;
  text-align: left;
}
</style>
