<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import HomeThemes from '@/components/HomeThemes.vue'
import config from '@/config'

const query = ref('')
const router = useRouter()

const doSearch = () => {
  router.push({ name: 'datasets', query: { q: query.value } })
}

const homepageTitle = config.website.homepage_title
const searchConfig = config.website.search_bar
</script>

<template>
  <section class="fr-container fr-py-12v">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col">
        <h1>{{ homepageTitle }}</h1>
        <p>
          <i>ecologie</i><strong>.data.gouv</strong><i>.fr</i> est un catalogue
          de données qui centralise les données de la transition écologique.
        </p>
        <p>
          Il vise à vous aider à trouver les données utiles au déploiement de
          politiques publiques portées par le ministère de la transition
          écologique et de la cohésion des territoires.
        </p>
      </div>
      <div class="fr-col-md-6 fr-hidden fr-unhidden-md fr-grid-row--center">
        <img style="max-width: 100%" src="../assets/home-global-schema.svg" />
      </div>
    </div>
  </section>
  <section class="fr-container--fluid bouquets">
    <div class="fr-container fr-py-12v">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col">
          <h2>Bouquets de données</h2>
          <p>
            Pour trouver les bonnes données, utiles à la mise en œuvre des
            politiques publiques environnementales, les données sont rassemblées
            sous forme de bouquets.
          </p>
          <p>
            En constante évolution, le catalogue sera progressivement enrichi de
            nouveaux bouquets de données.
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
            style="max-width: 100%"
            src="../assets/home-bouquets-schema.svg"
          />
        </div>
      </div>
      <div class="fr-mt-10v">
        <h6>Trouvez un bouquet en entrant par thématique</h6>
        <HomeThemes v-if="config.themes" />
      </div>
    </div>
  </section>
  <section v-if="searchConfig.display" class="fr-container fr-py-12v">
    <h2>Jeux de données</h2>
    <p>
      Parcourez tous les jeux de données présents sur <i>ecologie</i
      ><strong>.data.gouv</strong><i>.fr</i>.
    </p>
    <p>
      Au fur et à mesure de son enrichissement, le catalogue moissonnera de
      nouvelles données.
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
</template>

<style scoped lang="scss">
.bouquets {
  background-color: #f6f6f6;
}
</style>
