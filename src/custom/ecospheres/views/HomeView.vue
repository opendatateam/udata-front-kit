<script setup>
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import HomeThemes from '@/components/HomeThemes.vue'
import config from '@/config'

import contributeSvg from '../assets/contribuer.svg'
import explorerSvg from '../assets/explorer.svg'

const query = ref('')
const router = useRouter()

const doSearch = () => {
  router.push({ name: 'datasets', query: { q: query.value } })
}

const homepageTitle = config.website.homepage.title
const searchConfig = config.website.search_bar

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
    <section class="fr-container fr-py-12v">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col">
          <h1>{{ homepageTitle }}</h1>
          <p>
            <i>ecologie</i><strong>.data.gouv</strong><i>.fr</i> référence et
            centralise les données de la transition écologique.
          </p>
          <p>
            Le catalogue rassemble les données utiles au déploiement des
            politiques publiques portées par le Ministère de la Transition
            écologique et de la Cohésion des territoires.
          </p>
        </div>
        <div class="fr-col-md-6 fr-hidden fr-unhidden-md fr-grid-row--center">
          <img
            src="../assets/home-global-schema.svg"
            alt=""
            class="illustration"
            width="441"
            height="290"
          />
        </div>
      </div>
    </section>
    <section class="fr-container">
      <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-py-12v">
        <li class="fr-col-lg-6">
          <DsfrCard
            :no-arrow="true"
            :title="'Explorer'"
            :description="'Accédez à un ensemble de données environnementales'"
            size="small"
            :horizontal="true"
            :img-src="explorerSvg"
            alt-img=""
            class="explorer"
            :links-group="[
              {
                label: `Accéder aux données`,
                to: `/datasets`
              },
              {
                label: `Accéder aux bouquets`,
                to: `/bouquets`
              }
            ]"
          />
        </li>
        <li class="fr-col-lg-6">
          <DsfrCard
            :no-arrow="true"
            :title="'Contribuer'"
            :description="'Participez à la centralisation et la structuration des données environnementales'"
            size="small"
            :horizontal="true"
            :img-src="contributeSvg"
            alt-img=""
            class="contribute"
            :links-group="[
              {
                label: `Ajouter des données`,
                link: `https://www.data.gouv.fr/fr/pages/onboarding/producteurs/`
              },
              {
                label: `Créer un bouquet`,
                to: `/admin/bouquets/add`
              }
            ]"
          />
        </li>
      </ul>
    </section>
    <section class="fr-container--fluid bouquets">
      <div class="fr-container fr-py-12v">
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col">
            <h2>Bouquets de données</h2>
            <p>
              Retrouvez les données utiles à la mise en œuvre d'une politique
              publique spécifique sous forme de bouquets de données.
            </p>

            <a
              href="https://ecospheres.gitbook.io/doc/"
              target="_blank"
              rel="noopener noreferrer"
              class="fr-btn fr-btn--secondary fr-btn--md inline-flex"
              >Consulter la documentation</a
            >
          </div>
          <div class="fr-col-md-6 fr-hidden fr-unhidden-md fr-grid-row--center">
            <img
              src="../assets/home-bouquets-schema.svg"
              alt=""
              loading="lazy"
              class="illustration"
              width="441"
              height="290"
            />
          </div>
        </div>
        <div class="fr-mt-10v">
          <h3>Trouvez un bouquet par thématique</h3>
          <HomeThemes v-if="config.themes" />
        </div>
      </div>
    </section>
    <section v-if="searchConfig.display" class="fr-container fr-py-12v">
      <h2>Jeux de données</h2>
      <p>
        Recherchez parmi les données présentes sur <i>ecologie</i
        ><strong>.data.gouv</strong><i>.fr</i>.
      </p>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12 fr-col-md-8">
          <DsfrSearchBar
            v-model="query"
            button-text="Rechercher"
            class="search-bar-input"
            :label="searchConfig.placeholder"
            placeholder=""
            :large="true"
            @search="doSearch"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.bouquets {
  background-color: #f6f6f6;
}
.illustration {
  max-width: 100%;
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
</style>
