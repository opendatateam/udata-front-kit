<template>
  <div class="fr-mb-8w">
    <p class="fr-text--lead">
      {{ grist_data.Description_longue }}
    </p>

    <h2 class="fr-h2 fr-my-5w">Contexte et cadre juridique</h2>

    <h3 class="fr-h6">
      <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
      Contexte
    </h3>

    <p v-html="fromMarkdown(grist_data.Contexte)"></p>

    <h3 class="fr-h6">
      <span aria-hidden="true" class="fr-icon-newspaper-fill"></span>
      Cadre juridique
    </h3>

    <p v-html="fromMarkdown(grist_data.Cadre_juridique)"></p>

    <h2 class="fr-h2 fr-my-5w">Solutions disponibles</h2>

    <div
      v-for="reco_solution in grist_data.reco_solutions"
      :key="reco_solution.Nom_de_la_solution"
    >
      <SimplifionsRecoSolutions :reco_solution="reco_solution" />
    </div>

    <!-- <div v-for="(solutions, type_simplification) in grouped_reco_solutions" :key="type_simplification">
      <h3 class="fr-h3 fr-mb-3w">{{ type_simplification }}</h3>
      
      <div v-for="reco_solution in solutions" :key="reco_solution.Nom_de_la_solution">
        <SimplifionsRecoSolutions :reco_solution="reco_solution" />
      </div>
    </div> -->
  </div>
</template>

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

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { fromMarkdown } from '@/utils'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'

const props = defineProps<{
  topic: Topic
}>()

const grist_data = (props.topic.extras as any)['cas-d-usages'] as Record<
  string,
  any
>

// const grouped_reco_solutions = grist_data.reco_solutions.reduce((acc: Record<string, any[]>, reco_solution: any) => {
//   const key = reco_solution.Type_de_simplification
//   if (!acc[key]) {
//     acc[key] = []
//   }
//   acc[key].push(reco_solution)
//   return acc
// }, {} as Record<string, any[]>)
</script>
