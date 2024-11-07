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
const faqAccordionContents = [
  {
    id: 'faq_accordion_1',
    title: "Qu'est-ce que ecologie.data.gouv.fr ?",
    content: `<p>ecologie.data.gouv.fr est un catalogue permettant la centralisation des données de la transition écologique et leur renseignement par cas d'usage sous la forme de bouquets de données. <br/> Un bouquet est un ensemble de données contextualisées permettant de répondre à un cas d’usage lié à une politique publique. </p>`
  },
  {
    id: 'faq_accordion_2',
    title:
      'Quel est le lien entre le lien ecologie.data.gouv.fr et data.gouv.fr ?',
    content: 'WIP'
  },
  {
    id: 'faq_accordion_X',
    title: "À qui s'adresse cette plateforme ?",
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title: "Qu'est-ce que le concept de bouquet ?",
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title: 'Quelles données sont accessibles depuis ecologie.data.gouv.fr ?',
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title:
      'Comment rendre disponible un jeu de données sur ecologie.data.gouv.fr ?',
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title:
      "Je ne trouve pas le jeu de données dont j'ai besoin lors de la création d'un bouquet ?",
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title: `Je ne trouve pas un jeu de données dans l'onglet "Données" ?`,
    content: 'WIP content'
  },
  {
    id: 'faq_accordion_X',
    title: 'Un retour, une question ?',
    content: 'WIP content'
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
            v-for="accordion in faqAccordionContents"
            :id="accordion.id"
            :key="accordion.id"
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
