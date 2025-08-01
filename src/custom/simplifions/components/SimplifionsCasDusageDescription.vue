<template>
  <div class="test_cas-d-usage-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ casUsage.Titre }}</h1>
          <DraftTag v-if="topic.private" />
        </div>

        <p class="fr-text--lead">
          {{ casUsage.Description_longue }}
        </p>

        <SimplifionsTags :topic="topic" :page-key="pageKey" />
      </div>

      <div class="fr-col-12 fr-col-md-4">
        <nav
          role="navigation"
          aria-labelledby="fr-summary-title"
          class="fr-summary"
        >
          <h2 id="fr-summary-title" class="fr-summary__title fr-text--md">
            Sommaire
          </h2>
          <ol>
            <li v-if="casUsage.Contexte || casUsage.Cadre_juridique">
              <a
                id="summary-link-1"
                href="#contexte-et-cadre-juridique"
                class="fr-summary__link"
                >Contexte et cadre juridique</a
              >
            </li>
            <li v-if="casUsage.reco_solutions?.length">
              <a
                id="summary-link-2"
                href="#solutions-disponibles"
                class="fr-summary__link"
                >Solutions disponibles</a
              >
              <ol v-if="casUsage.reco_solutions?.length">
                <li
                  v-for="(group, index) in grouped_reco_solutions"
                  :key="group.title"
                >
                  <a
                    :href="`#reco-group-${index + 1}`"
                    class="fr-summary__link"
                    >{{ group.title }}</a
                  >
                </li>
              </ol>
            </li>
          </ol>
          <hr class="fr-hr fr-my-2w" />
          <p class="fr-text--sm">
            <span class="subtitle">Contenu rédigé par :</span>
            <span v-if="topic.organization">
              <a :href="topic.organization.page">
                <OrganizationNameWithCertificate
                  :organization="topic.organization"
                />
              </a>
            </span>
            <br />
            <span>
              le
              <time :datetime="topic.created_at"
                >{{ formatDate(topic.created_at) }}.</time
              >
            </span>
            <br />
            <span class="fr-text--xs"
              >Modifié le
              <time :datetime="topic.last_modified"
                >{{ formatDate(topic.last_modified) }}.</time
              >
            </span>
          </p>
        </nav>
      </div>
    </div>

    <div
      v-if="casUsage.Contexte || casUsage.Cadre_juridique"
      class="fr-col-12 fr-col-md-8"
    >
      <h2 id="contexte-et-cadre-juridique" class="h2-cas-usage fr-h2 fr-my-5w">
        Contexte et cadre juridique
      </h2>

      <div v-if="casUsage.Contexte">
        <h3 class="fr-h6">
          <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
          Contexte
        </h3>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="fromMarkdown(casUsage.Contexte)"></p>
      </div>

      <div v-if="casUsage.Cadre_juridique">
        <h3 class="fr-h6">
          <span aria-hidden="true" class="fr-icon-newspaper-fill"></span>
          Cadre juridique
        </h3>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="fromMarkdown(casUsage.Cadre_juridique)"></p>
      </div>
    </div>

    <div v-if="casUsage.reco_solutions?.length">
      <h2 id="solutions-disponibles" class="h2-cas-usage fr-h2 fr-my-5w">
        Solutions disponibles
      </h2>

      <div
        v-for="(group, index) in grouped_reco_solutions"
        :key="group.title"
        class="fr-mb-4w"
      >
        <h3 :id="`reco-group-${index + 1}`" class="h3-cas-usage fr-h3 fr-mb-3w">
          {{ group.title }}
        </h3>

        <div
          v-for="reco_solution in group.reco_solutions"
          :key="reco_solution.Nom_de_la_solution_publique"
        >
          <SimplifionsRecoSolutions :reco-solution="reco_solution" />
        </div>
      </div>
    </div>

    <div v-if="usefulDataApi.length">
      <h2 class="h2-cas-usage fr-h2 fr-mt-5w">
        Utiliser les jeux de données et API utiles
      </h2>

      <SimplifionsDataApiList
        :data-api-list="usefulDataApi"
        :custom-descriptions="customDescriptionsForDataApi"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { formatDate, fromMarkdown } from '@/utils'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import type {
  RecoSolution,
  SimplifionsCasUsagesExtras
} from '../model/cas_usage'
import SimplifionsDataApiList from './SimplifionsDataApiList.vue'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const casUsage = (props.topic.extras as SimplifionsCasUsagesExtras)[
  'simplifions-cas-d-usages'
]

const budget_group = (budget: Array<string>) => {
  if (!budget) {
    return ''
  }
  if (budget.includes('Aucun développement, ni budget')) {
    return 'Aucun développement, ni budget'
  }
  return 'Avec des moyens techniques ou un éditeur de logiciel'
}

const customDescriptionsForDataApi =
  casUsage.descriptions_api_et_donnees_utiles.reduce(
    (acc, description) => {
      acc[description.uid_datagouv] = description.Description_de_l_utilisation
      return acc
    },
    {} as Record<string, string>
  )

// Affichage des parties reco solutions, dans l'ordre voulu

const grouped_reco_solutions = casUsage.reco_solutions
  .reduce(
    (
      acc: Array<{ title: string; reco_solutions: RecoSolution[] }>,
      reco_solution: RecoSolution
    ) => {
      const title = budget_group(
        reco_solution.Moyens_requis_pour_la_mise_en_oeuvre
      )
      const existingGroup = acc.find((group) => group.title === title)

      if (existingGroup) {
        existingGroup.reco_solutions.push(reco_solution)
      } else {
        acc.push({ title, reco_solutions: [reco_solution] })
      }

      return acc
    },
    [] as Array<{ title: string; reco_solutions: RecoSolution[] }>
  )
  .sort(
    (
      a: { title: string; reco_solutions: RecoSolution[] },
      b: { title: string; reco_solutions: RecoSolution[] }
    ) => a.title.localeCompare(b.title)
  )

const usefulDataApi = computed(() => {
  if (!casUsage.API_et_donnees_utiles) {
    return []
  }
  return casUsage.API_et_donnees_utiles.filter(
    (apidOrData) => apidOrData.UID_data_gouv
  )
})
</script>

<style scoped>
.h2-cas-usage {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}

.h3-cas-usage {
  color: #616161;
}
</style>
