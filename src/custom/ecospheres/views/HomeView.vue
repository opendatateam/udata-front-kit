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
          />
        </div>
      </div>
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
            <DsfrButton secondary>
              <a
                href="https://ecospheres.gitbook.io/doc/"
                target="_blank"
                rel="noopener noreferrer"
                >Consulter la documentation</a
              >
            </DsfrButton>
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
          <h6>Trouvez un bouquet par thématique</h6>
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
            :placeholder="searchConfig.placeholder"
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
</style>
