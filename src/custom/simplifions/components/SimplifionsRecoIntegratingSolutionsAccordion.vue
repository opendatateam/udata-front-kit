<template>
  <section v-if="!solutions.length" class="fr-accordion">
    <h6 class="fr-accordion__title">
      <span class="fr-accordion__btn fr-accordion__btn--empty">
        {{ title }}
        <span aria-hidden="true" class="fr-icon-subtract-line fr-icon--sm fr-ml-auto"></span>
        <span class="fr-sr-only">(Aucune solution référencée)</span>
      </span>
    </h6>
  </section>
  <DsfrAccordion v-else title-tag="h6">
    <template #title>{{ title }}</template>
    <slot />
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
      <div
        v-for="solution in solutions"
        :key="solution.id"
        class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
      >
        <SimplifionsRecoSolutionsIntegratricesCard
          :solution="solution"
          :integration-score="integrationScorePerSolution.get(solution.id)"
          :nom-fournisseur="nomFournisseur"
          :type-label="typeLabel"
        />
      </div>
    </div>
  </DsfrAccordion>
</template>

<script setup lang="ts">
import type { SolutionRecord } from '../model/grist'
import SimplifionsRecoSolutionsIntegratricesCard from './SimplifionsRecoSolutionsIntegratricesCard.vue'

defineProps<{
  title: string
  solutions: SolutionRecord[]
  integrationScorePerSolution: Map<number, { integratedCount: number; totalCount: number }>
  nomFournisseur: string
  typeLabel: string
}>()
</script>

<style scoped>
.fr-accordion__btn--empty {
  color: var(--text-disabled-grey);
  cursor: text;
}

.fr-accordion__btn--empty::after {
  display: none;
}
</style>
