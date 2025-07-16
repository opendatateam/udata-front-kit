<template>
  <div>
    <p class="fr-text--small">
      <em>{{ casUsage.Description_courte }}</em>
    </p>

    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ casUsage.Titre }}</h1>
        </div>

        <p class="fr-text--lead">
          {{ casUsage.Description_longue }}
        </p>
        <!--Texte pour préciser les usagers et les fournisseurs de service-->
        <div v-if="groupedTags['target-users']" class="fr-card__detail">
          <p class="fr-mb-1w" style="white-space: normal;">
            Démarches des 
            <span
              v-for="(t, index) in filteredTargetUsers"
              :key="t.id"
              class="tag-item"
            >
              <span class="font-bold">{{ t.name }}</span>
              <span
                v-if="index < filteredTargetUsers.length - 1"
                class="fr-mx-1v"
                style="font-weight: normal;"
              >|</span>
            </span>
          </p>
        </div>
        <div
          v-if="groupedTags['fournisseurs-de-service']"
          class="fr-card__detail fr-text--right"
        >
          <p class="fr-mb-1w" style="white-space: normal;">
            À destination des 
            <span
              v-for="(t, index) in groupedTags['fournisseurs-de-service']"
              :key="t.id"
              class="tag-item"
            >
              <span class="font-bold">{{ t.name }}</span>
              <span
                v-if="index < groupedTags['fournisseurs-de-service'].length - 1"
                class="fr-mx-1v"
                style="font-weight: normal;"
              >|</span>
            </span>
          </p>
        </div>
         <!-- Tags indiquant le type de simplification et de budget -->
        <div v-if="groupedTags['types-de-simplification']" class="simplification-group fr-mt-2w">
          <ul class="fr-badges-group">
            <li v-for="t in groupedTags['types-de-simplification']" :key="t.id">
              <TagComponent :tag="t" />
            </li>
          </ul>
        </div>
        <div v-if="groupedTags['budget']" class="budget-group">
          <ul class="fr-badges-group">
            <li v-for="t in groupedTags['budget']" :key="t.id">
              <TagComponent :tag="t" />
            </li>
          </ul>
        </div>
      </div>

      <div class="fr-col-12 fr-col-md-4">
        <nav
          aria-labelledby="fr-summary-title"
          role="navigation"
          class="fr-summary"
        >
          <h2 id="fr-summary-title" class="fr-h6">Sommaire</h2>
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
        </nav>
      </div>
    </div>

    <div class="fr-col-12 fr-col-md-8">
      <h2 class="fr-h2 fr-my-5w">Contexte et cadre juridique</h2>

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

    <h2 class="fr-h2 fr-my-5w">Solutions disponibles</h2>

    <div
      v-for="(title, index) in Object.keys(grouped_reco_solutions)"
      :key="title"
      class="fr-mb-4w"
    >
      <h3 :id="`solution-${index + 1}`" class="fr-h3 fr-mb-3w">
        {{ index + 1 }}. {{ title }}
      </h3>

      <div
        v-for="reco_solution in grouped_reco_solutions[title]"
        :key="reco_solution.Nom_de_la_solution"
      >
        <SimplifionsRecoSolutions :reco_solution="reco_solution" />
      </div>
    </div>

    <h2 class="fr-h2 fr-mt-5w fr-mb-0">
      ➡️ Utiliser les jeux de données et API utiles
    </h2>
  </div>
</template>

<script setup lang="ts">
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import { fromMarkdown } from '@/utils'
import { useTagsByRef } from '@/utils/tags'
import { ref } from 'vue'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const topicRef = ref(props.topic)
const tags = useTagsByRef(props.pageKey, topicRef)

const casUsage = (props.topic.extras as any)[
  'simplifions-cas-d-usages'
] as Record<string, any>

const budget_group = (budget: Array<string>) => {
  if (budget.includes('Aucun développement, ni budget')) {
    return 'Aucun développement, ni budget'
  }
  return 'Avec des moyens techniques ou un éditeur de logiciel'
}

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

// Regrouper les tags par type
const groupedTags = computed(() => {
  const groups: Record<string, typeof tags.value> = {}
  for (const tag of tags.value) {
    if (!groups[tag.type]) {
      groups[tag.type] = []
    }
    groups[tag.type].push(tag)
  }
  return groups
})

const filteredTargetUsers = computed(() => {
  return (groupedTags.value['target-users'] || []).filter(tag => tag.name !== 'Agents publics')
})
</script>

<style scoped>
h2 {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}
h3 {
  color: #616161;
}
</style>
