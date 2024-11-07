<script setup lang="ts">
import { useHead } from '@unhead/vue'
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import BouquetCardHome from '@/components/bouquets/BouquetCardHome.vue'
import config from '@/config'
import type { Topic } from '@/model/topic'

import { useTopicStore } from '@/store/TopicStore'

import contributeSvg from '../assets/contribuer.svg'
import explorerSvg from '../assets/explorer.svg'

const topicStore = useTopicStore()
const lastTopics: ComputedRef<Topic[]> = computed(() =>
  topicStore.sorted.filter((bouquet) => !bouquet.private).slice(0, 3)
)

onMounted(() => topicStore.loadTopicsForUniverse())

const activeAccordion = ref<string>()
const setActiveAccordion = (id: string) => {
  activeAccordion.value = id
}
const faqEcologieDataGouvHtml = `<span class="fr-text--italic">ecologie.<span class="fr-text--bold">data.gouv</span>.fr</span>`
const faqDataGouvHtml = `<span class="fr-text--italic"><span class="fr-text--bold">data.gouv</span>.fr</span>`
const faqMinisterLink = `<a href="https://www.ecologie.gouv.fr/" class="fr-link" target="_blank">Ministère de la Transition écologique, de l'Énergie, du Climat et de la Prévention des risques</a>`
const faqAccordionContents = [
  {
    title: "Qu'est-ce que ecologie.data.gouv.fr ?",
    content: `<p>${faqEcologieDataGouvHtml} est la plateforme publique mettant à disposition les données relatives à la transition écologique. Elle permet de rendre accessible au public des informations fiables et structurées, issues des institutions publiques et des acteurs privés. L'objectif est de rassembler les données utiles au déploiement des politiques publiques portées par le ${faqMinisterLink} dans des secteurs comme l'environnement, l'énergie, le transport et le logement.</p>`
  },
  {
    title:
      'Quel est le lien entre le lien ecologie.data.gouv.fr et data.gouv.fr ?',
    content: `<p>${faqEcologieDataGouvHtml} est une verticale thématique de ${faqDataGouvHtml}, la plateforme nationale de données, dédiée aux thématiques liées à la transition écologique.</p>
<p>Bien que présentant des contenus éditoriaux et des fonctionnalités spécifiques, les deux plateformes partagent le même catalogue, auquel nous contribuons avec les données du pôle ministériel <a href="https://www.ecologie.gouv.fr/" target="_blank" class="fr-link">ecologie.gouv.fr</a>. Toute modification sur ${faqDataGouvHtml} est donc immédiatement visible sur ${faqEcologieDataGouvHtml}, et inversement.</p>
<p>${faqEcologieDataGouvHtml} fait partie d'un écosystème naissant de verticales thématiques construites à partir d'un <a href="https://github.com/opendatateam/udata-front-kit" target="_blank">commun numérique</a> porté et co-développé par le CGDD et la DINUM.</p>`
  },
  {
    title: "À qui s'adresse cette plateforme ?",
    content: `<p>${faqEcologieDataGouvHtml} s'adresse principalement :</p>
<ul>
<li>aux producteurs de données souhaitant ouvrir et valoriser leurs données en lien avec la transition écologique</li>
<li>aux utilisateurs de données œuvrant à déployer les politiques publiques portées par le ${faqMinisterLink}</li>
<li>mais aussi à tout citoyen curieux souhaitant découvrir des données en lien avec les enjeux écologiques.</li>
</ul>
<p>Grâce à une approche par cas d'usage, la plateforme propose un accès structuré à des données environnementales organisées autour de problématiques précises, facilitant ainsi leur réutilisation et adaptation sur différents territoires.</p>
`
  },
  {
    title: "Qu'est-ce que le concept de guichet unique de la donnée ?",
    content: `<p>Le guichet unique de la donnée est un point d’accès centralisé permettant de regrouper et de simplifier l’accès aux données d’intérêt public.</p>

<p>${faqEcologieDataGouvHtml} centralise les données utiles au déploiement des politiques liées à la transition écologique, en les rendant accessibles et facilement réutilisables pour tous les acteurs, administrations, décideurs publics, citoyens ou chercheurs. La plateforme propose aux utilisateurs un portail unique pour consulter et exploiter des informations provenant de différentes sources institutionnelles, facilitant ainsi la recherche de données et renforçant la transparence.</p>`
  },
  {
    title: "Qu'est-ce que le concept de bouquet ?",
    content: `<p>Un bouquet de données désigne un ensemble cohérent de jeux de données regroupés autour d'une thématique ou d'un enjeu spécifique sur un territoire donné.</p>

<p>Un bouquet de données :</p>
<ul>
<li>s'insère dans le contexte d’une politique publique, nationale et/ou locale, et de ses objectifs,</li>
<li>pose une problématique claire autour des décisions à soutenir,</li>
<li>détaille les informations utiles à l’éclairage de ces décisions et les données disponibles qui les renseignent.</li>
</ul>
<p>Les bouquets de données répondent ainsi au besoin de centraliser et de référencer les données liées à la mise en œuvre d’une politique publique précise sur différents territoires.</p>`
  },
  {
    title: 'Quelles données sont accessibles depuis ecologie.data.gouv.fr ?',
    content: `<p>Les données présentées sur ${faqEcologieDataGouvHtml} sont une sélection du catalogue de données moissonnées ou publiées dans ${faqDataGouvHtml}. Elles sont produites par des organisations dont les données ont un intérêt en lien avec la transition écologique, ou qui sont en lien avec le ${faqMinisterLink}.</p>

<p>Lors de la création d'un bouquet de données, il est également possible d’inclure des jeux de données provenant de l'ensemble du catalogue de data.gouv.fr, permettant ainsi d’ajouter des données pertinentes pour une thématique, même si elles sont produites par des organisations non référencées sur ${faqEcologieDataGouvHtml}.</p>`
  },
  {
    title:
      'Comment rendre disponible un jeu de données sur ecologie.data.gouv.fr ?',
    content: `WIP content`
  },
  {
    title:
      "Je ne trouve pas le jeu de données dont j'ai besoin lors de la création d'un bouquet ?",
    content: `WIP content`
  },
  {
    title: `Je ne trouve pas un jeu de données dans l'onglet "Données" ?`,
    content: `WIP content`
  },
  {
    title: 'Un retour, une question ?',
    content: `WIP content`
  }
]

useHead({
  meta: [
    { property: 'og:title', content: config.website.title },
    { name: 'description', content: config.website.homepage.meta_description },
    {
      property: 'og:description',
      content: config.website.homepage.meta_description
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin }]
})
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">
        Le&nbsp;catalogue des&nbsp;données
        <br />
        pour la <span class="highlight">transition écologique</span>
      </h1>
      <div class="big-search">
        <SearchComponent
          id="big-select-search"
          placeholder="Rechercher"
          search-label="Rechercher"
        />
        <p for="select-search">
          Exemple : "Itinéraires fraîcheur" dans les bouquets ou "Horaires des
          TGV" dans les données
        </p>
      </div>
    </section>
    <section class="fr-container">
      <ul class="fr-grid-row fr-grid-row--gutters fr-py-12v" role="list">
        <li class="fr-col-12 fr-col-md-6">
          <DsfrCard
            :no-arrow="true"
            title="Explorer"
            description="Accédez à un ensemble de données liées à la transition écologique"
            size="small"
            :horizontal="true"
            :img-src="explorerSvg"
            alt-img=""
            class="explorer"
            :links-group="[
              {
                label: 'Accéder aux données',
                to: '/datasets'
              },
              {
                label: 'Accéder aux bouquets',
                to: '/bouquets'
              }
            ]"
          />
        </li>
        <li class="fr-col-12 fr-col-md-6">
          <DsfrCard
            :no-arrow="true"
            title="Contribuer"
            description="Participez à la centralisation et à la structuration des données de la transition écologique"
            size="small"
            :horizontal="true"
            :img-src="contributeSvg"
            alt-img=""
            class="contribute"
            :links-group="[
              {
                label: 'Ajouter des données',
                link: 'https://www.data.gouv.fr/fr/pages/onboarding/producteurs/'
              },
              {
                label: 'Créer un bouquet',
                to: '/admin/bouquets/add'
              }
            ]"
          />
        </li>
      </ul>
    </section>
    <section class="fr-container--fluid bouquets">
      <div class="fr-container fr-py-12v">
        <h2>
          Les bouquets : pourquoi orchestrer des ensembles de données par usage
          ?
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col">
            <ul class="fr-grid-row organize-data" role="list">
              <li class="fr-col-12 fr-col-lg-4">
                <div class="fr-grid-row">
                  <div class="fr-col-md-3">
                    <img
                      src="../assets/sign-document.svg"
                      alt=""
                      class="illustration fr-mx-auto block"
                      width="64"
                      height="64"
                    />
                  </div>
                  <div class="fr-col-md-9">
                    <h3>Répondre aux besoins d'une politique publique</h3>
                    <p>
                      Des problématiques liées à l'usage de la donnée sont
                      identifiées sur des thématiques de la transition
                      écologique telles que l’énergie ou le transport.
                    </p>
                  </div>
                </div>
              </li>
              <li class="fr-col-12 fr-col-lg-4">
                <div class="fr-grid-row">
                  <div class="fr-col-md-3">
                    <img
                      src="../assets/binders.svg"
                      alt=""
                      class="illustration fr-mx-auto block"
                      width="64"
                      height="64"
                    />
                  </div>
                  <div class="fr-col-md-9">
                    <h3>Identifier les informations utiles</h3>
                    <p>
                      Les différentes typologies de données nécessaires pour les
                      services spécialistes de ces politiques sont définies.
                    </p>
                  </div>
                </div>
              </li>
              <li class="fr-col-12 fr-col-lg-4">
                <div class="fr-grid-row">
                  <div class="fr-col-md-3">
                    <img
                      src="../assets/document-add.svg"
                      alt=""
                      class="illustration fr-mx-auto block"
                      width="64"
                      height="64"
                    />
                  </div>
                  <div class="fr-col-md-9">
                    <h3>Centraliser les données territoriales</h3>
                    <p>
                      Les données territoriales sont collectées, regroupées et
                      catégorisées par cas d’usage sous la forme de bouquets.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section class="fr-container fr-py-12v">
      <h2>Les bouquets à découvrir</h2>
      <ul class="fr-grid-row fr-grid-row--gutters" role="list">
        <li
          v-for="topic in lastTopics"
          :key="topic.id"
          class="fr-col-12 fr-col-xl-4"
        >
          <BouquetCardHome :bouquet="topic" />
        </li>
      </ul>
    </section>
    <section class="fr-container--fluid faq">
      <div class="fr-container fr-py-12v faq">
        <h2>Foire aux questions</h2>
        <DsfrAccordionsGroup v-model="activeAccordion">
          <DsfrAccordion
            v-for="(accordion, index) in faqAccordionContents"
            :id="accordion.id"
            :key="`faq_accordion_6${index}`"
            :title="accordion.title"
            :expanded-id="activeAccordion"
            :class="{ active: activeAccordion == accordion.id }"
            @expand="setActiveAccordion($event)"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="accordion.content"></div>
          </DsfrAccordion>
        </DsfrAccordionsGroup>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bouquets,
.faq {
  background-color: #f6f6f6;
}
.illustration {
  max-width: 100%;
}
.organize-data {
  background-color: white;
  padding: 32px 0;

  li {
    border-right: 1px solid var(--border-default-grey);
    padding-right: 1rem;
  }

  li:last-child {
    border: none;
  }

  @media (max-width: 992px) {
    padding: 16px;

    h3 {
      margin: 1rem 0 0.5rem;
    }

    li {
      border-right: none;
      border-bottom: 1px solid var(--border-default-grey);
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }

    li:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  h4 {
    margin-top: 5px;
  }

  p {
    margin-bottom: 0;
  }
}

:deep(.fr-links-group) {
  li {
    display: block;
  }

  li a {
    color: var(--text-action-high-blue-france);
  }

  li a::after {
    content: ' →';
  }

  .fr-link {
    /* Overide style for external link */
    font-size: inherit;
    margin: inherit;
    vertical-align: inherit;
  }
}

:deep(.fr-card__content) {
  padding-left: 1rem;
  padding-bottom: 0;

  .fr-card__desc {
    font-size: 1rem;
  }
}

:deep(.fr-card__header) {
  flex: 0 0 33%;

  .fr-card__img img {
    object-fit: contain;
    object-position: bottom;
  }
}

.explorer :deep(.fr-card__img img) {
  object-position: -25px bottom;
}

@media (max-width: 768px) {
  :deep(.fr-card__header) {
    flex: 0 0 25%;
  }

  :deep(.fr-card__header .fr-card__img) {
    height: 120px;
    overflow: hidden;
  }

  :deep(.fr-card__header .fr-card__img img) {
    object-position: left bottom;
  }

  .explorer :deep(.fr-card__img img) {
    position: relative;
    top: 25%;
    left: 1rem;
    height: 65%;
  }

  .contribute :deep(.fr-card__img img) {
    position: relative;
    left: 1rem;
    height: 120%;
  }
}
.faq {
  :deep(.fr-accordions-group) {
    .fr-accordion.active {
      .fr-accordion__title,
      .fr-accordion__title button:hover {
        background-color: var(--blue-france-925-125);
      }
    }
    .fr-accordion__title span {
      color: #000091; /*var(--blue-france-975-sun-113) not working*/
    }
    .fr-collapse {
      background-color: white;
      margin: 0;
    }
  }
}
:deep(.fr-accordion__btn:after) {
  content: url('../assets/arrow-down.svg');
  background-color: inherit;
  mask-image: inherit;
}

:deep(.fr-accordion.active .fr-accordion__btn:after) {
  content: url('../assets/arrow-up.svg');
}

.main-title-v2 {
  text-align: center;
  font-size: clamp(1.375rem, 0.4698rem + 4.5259vw, 4rem);

  @media (max-width: 768px) {
    text-align: inherit;
  }
}
.main-title-v2 :deep(.highlight) {
  color: #000091;
}

.big-search {
  max-width: 792px;
  margin: 0 auto;
}
</style>
