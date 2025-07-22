<template>
  <div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ casUsage.Titre }}</h1>
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
            <li>
              <a
                id="summary-link-1"
                href="#contexte-et-cadre-juridique"
                class="fr-summary__link"
                >Contexte et cadre juridique</a
              >
            </li>
            <li>
              <a
                id="summary-link-2"
                href="#solutions-disponibles"
                class="fr-summary__link"
                >Solutions disponibles</a
              >
              <ol>
                <li
                  v-for="(title, index) in Object.keys(grouped_reco_solutions)"
                  :key="title"
                >
                  <a
                    :href="`#solution-${index + 1}`"
                    class="fr-summary__link"
                    >{{ title }}</a
                  >
                </li>
              </ol>
            </li>
          </ol>
          <hr class="fr-hr fr-my-2w" />
          <p class="subtitle">
            Contenu rédigé par :
            <span v-if="topic.organization" style="font-weight: normal">
              <a :href="topic.organization.page">
                <OrganizationNameWithCertificate
                  :organization="topic.organization"
                />
              </a>
            </span>
            <br />
            <span style="font-weight: normal">
              le
              <time :datetime="topic.created_at"
                >{{ formatDate(topic.created_at) }}.</time
              >
            </span>
            <br />
            <span class="fr-text--xs" style="font-weight: normal"
              >Modifié le
              <time :datetime="topic.last_modified"
                >{{ formatDate(topic.last_modified) }}.</time
              >
            </span>
          </p>
        </nav>
      </div>
    </div>

    <div class="fr-col-12 fr-col-md-8">
      <h2 class="h2-cas-usage fr-h2 fr-my-5w">Contexte et cadre juridique</h2>

      <h3 class="fr-h6">
        <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
        Contexte
      </h3>

      <p v-html="fromMarkdown(casUsage.Contexte)"></p>

      <h3 class="fr-h6">
        <span aria-hidden="true" class="fr-icon-newspaper-fill"></span>
        Cadre juridique
      </h3>

      <p v-html="fromMarkdown(casUsage.Cadre_juridique)"></p>
    </div>

    <h2 class="h2-cas-usage fr-h2 fr-my-5w">Solutions disponibles</h2>

    <div
      v-for="(title, index) in sorted_grouped_reco_solutions"
      :key="title"
      class="fr-mb-4w"
    >
      <h3 :id="`solution-${index + 1}`" class="h3-cas-usage fr-h3 fr-mb-3w">
        {{ index + 1 }}. {{ title }}
      </h3>

      <div
        v-for="reco_solution in grouped_reco_solutions[title]"
        :key="reco_solution.Nom_de_la_solution"
      >
        <SimplifionsRecoSolutions :reco_solution="reco_solution" />
      </div>
    </div>

    <h2 class="h2--cas-usage fr-h2 fr-mt-5w fr-mb-0">
      ➡️ Utiliser les jeux de données et API utiles
    </h2>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { formatDate, fromMarkdown } from '@/utils'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { computed, ref } from 'vue'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const topicRef = ref(props.topic)

const casUsage = (props.topic.extras as any)[
  'simplifions-cas-d-usages'
] as Record<string, any>

const budget_group = (budget: Array<string>) => {
  if (budget.includes('Aucun développement, ni budget')) {
    return 'Aucun développement, ni budget'
  }
  return 'Avec des moyens techniques ou un éditeur de logiciel'
}

// Affichage des parties reco solutions, dans l'ordre voulu

const grouped_reco_solutions = casUsage.reco_solutions.reduce(
  (acc: Record<string, any[]>, reco_solution: any) => {
    const key = budget_group(reco_solution.Moyens_requis_pour_la_mise_en_oeuvre)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(reco_solution)
    return acc
  },
  {} as Record<string, any[]>
)

const priorityKey = 'Aucun développement, ni budget'

const sorted_grouped_reco_solutions = computed(() => {
  const keys = Object.keys(grouped_reco_solutions)
  return keys.sort((a, b) => {
    if (a === priorityKey) return -1
    if (b === priorityKey) return 1
    return 0
  })
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
