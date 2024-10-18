<script setup>
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import HomeThemes from '@/components/HomeThemes.vue'
import config from '@/config'

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
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
    <section class="fr-container--fluid bouquets">
      <div class="fr-container fr-py-12v">
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
                      Des problématiques data sont identifiées en lien avec des
                      services métiers
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
                      Les facteurs pertinents pour l'orientation de cette action
                      sont définis
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
                      reliées aux facteurs correspondants
                    </p>
                  </div>
                </div>
              </li>
            </ul>
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
</style>
