<script setup lang="ts">
import { useHead } from '@unhead/vue'
import type { ComputedRef } from 'vue'
import { computed, onMounted } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import config from '@/config'
import HomeFaq from '@/custom/ecospheres/components/HomeFaq.vue'
import type { Topic } from '@/model/topic'

import { useTopicStore } from '@/store/TopicStore'

import contributeSvg from '../assets/contribuer.svg'
import explorerSvg from '../assets/explorer.svg'

const topicStore = useTopicStore()
const router = useRouter()
const lastTopics: ComputedRef<Topic[]> = computed(() =>
  topicStore.sorted.filter((topic) => !topic.private).slice(0, 3)
)

onMounted(() => topicStore.loadTopicsForUniverse(['bouquets']))

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
const dropdown = config.website.header_search.dropdown
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">
        Le catalogue des données
        <br />
        pour la <span class="highlight">transition écologique</span>
      </h1>
      <div class="big-search">
        <SearchComponent
          id="big-select-search"
          placeholder="Rechercher"
          search-label="Rechercher"
          :dropdown="dropdown"
        />
        <p class="text-grey-300 fr-text--sm">
          Exemple&nbsp;: "&nbsp;Itinéraires fraîcheur&nbsp;" dans les bouquets
          ou "&nbsp;Horaires des TGV&nbsp;" dans les données
        </p>
      </div>
    </section>
    <section class="fr-container explore-contribute fr-px-0">
      <ul class="fr-grid-row fr-grid-row--gutters fr-pb-12v" role="list">
        <li class="fr-col-12 fr-col-md-6">
          <DsfrCard
            :no-arrow="true"
            title="Explorer"
            description="Accéder aux données des services et opérateurs de l’État et d’une sélection d’organisations publiant des données utiles aux politiques du ministère en charge des territoires, de l’écologie et du logement."
            size="small"
            :horizontal="true"
            :img-src="explorerSvg"
            alt-img=""
            class="explorer"
            :links-group="[
              {
                label: 'Parcourir les données',
                to: router.resolve({ name: 'datasets' }).href
              },
              {
                label: 'Découvrir des usages',
                to: router.resolve({ name: 'bouquets' }).href
              }
            ]"
          />
        </li>
        <li class="fr-col-12 fr-col-md-6">
          <DsfrCard
            :no-arrow="true"
            title="Contribuer"
            description="Participez au référencement et à l’articulation des données utiles à l’appui des politiques publiques grâce aux fonctionnalités de catalogage de data.gouv et au concept de bouquet de données."
            size="small"
            :horizontal="true"
            :img-src="contributeSvg"
            alt-img=""
            class="contribute"
            :links-group="[
              {
                label: 'Publier des données',
                link: 'https://www.data.gouv.fr/fr/pages/onboarding/producteurs/'
              },
              {
                label: 'Partager des usages',
                to: router.resolve({ name: 'bouquets_add' }).href
              }
            ]"
          />
        </li>
      </ul>
    </section>
    <section class="fr-container--fluid bouquets">
      <div class="fr-container fr-py-16v">
        <h2>
          Bouquets de données&nbsp;: articuler politiques publiques et données
          territoriales
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
                    <h3>Documenter un besoin</h3>
                    <p>
                      Quels enjeux cherche-t-on à soutenir&nbsp;? Quels sont les
                      acteurs concernés&nbsp;? Un bouquet de données est créé au
                      nom d’un utilisateur ou d’une organisation. Tous les
                      membres d’une organisation peuvent éditer le bouquet.
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
                    <h3>Lister les informations utiles</h3>
                    <p>
                      Quelles sont les informations géographiques ou les
                      indicateurs pertinents&nbsp;? Les bouquets de données
                      permettent de renseigner les informations souhaitées
                      indépendamment de l’existence des données.
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
                    <h3>Associer les données disponibles</h3>
                    <p>
                      Les données existantes satisfont-elles les besoins du cas
                      d’usage&nbsp;? L’association peut se faire dans sa forme
                      la plus interopérable via une donnée cataloguée sur
                      data.gouv ou le renseignement d’un URL.
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
      <ul class="fr-grid-row fr-grid-row--gutters fr-mb-2w" role="list">
        <li
          v-for="topic in lastTopics"
          :key="topic.id"
          class="fr-col-12 fr-col-xl-4"
        >
          <TopicCard
            :topic="topic"
            topicSlug="bouquets"
            :hide-description="true"
          />
        </li>
      </ul>
      <p class="fr-m-0">
        <RouterLink
          :to="{
            name: 'bouquets'
          }"
          class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
        >
          Voir les bouquets
        </RouterLink>
      </p>
    </section>
    <section class="fr-container--fluid faq">
      <div class="fr-container fr-py-16v faq">
        <h2>Foire aux questions</h2>
        <HomeFaq />
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
  padding: 2rem 0;

  li {
    border-right: 1px solid var(--border-default-grey);
    padding-right: 1rem;
  }

  li:last-child {
    border: none;
  }

  @media (max-width: 992px) {
    & {
      padding: 1rem;
    }

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
    margin-left: 0.5rem;
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
:deep(.fr-card--sm .fr-card__footer) {
  padding: 0 0 2rem;
}

.explore-contribute :deep(.fr-card__body) {
  padding-left: 1.5rem;
}
.explore-contribute .fr-grid-row--gutters .fr-col-12 {
  padding: 1.75rem;
}

:deep(.fr-card__header) {
  flex: 0 0 33%;

  .fr-card__img img {
    object-fit: contain;
    object-position: bottom;
  }
}

.explorer :deep(.fr-card__img) {
  overflow: hidden;
}
.explorer :deep(.fr-card__img img) {
  object-position: -25px 65%;
  transform: scale(1.3);
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
    transform: inherit;
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
