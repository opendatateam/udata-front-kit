<template>
  <section v-if="!solutions.length" class="fr-accordion">
    <h6 class="fr-accordion__title">
      <span class="fr-accordion__btn fr-accordion__btn--empty">
        <span class="fr-mr-auto">
          {{ title }}
          <span
            :class="[
              'fr-badge',
              'fr-badge--sm',
              'fr-badge--icon-left',
  
              'fr-text-mention--grey',
              'fr-ml-1w',
              badgeIconClass,
            ]"
          >
            {{ emptyBadgeLabel }}
          </span>
          <span v-if="solutionKind !== 'brique'" class="fr-badge fr-badge--sm fr-badge--new fr-ml-1w">
            Sans développement
          </span>
        </span>
        <span aria-hidden="true" class="fr-icon-subtract-line fr-icon--sm"></span>
        <span class="fr-sr-only">(Aucune solution référencée)</span>
      </span>
    </h6>
  </section>
  <DsfrAccordion v-else title-tag="h6">
    <template #title>
      <span class="fr-mr-auto">
        {{ title }}
        <span
          :class="[
            'fr-badge',
            'fr-badge--sm',
            'fr-badge--icon-left',
            'fr-background-contrast--info',
            'fr-text-default--info',
            'fr-ml-1w',
            badgeIconClass,
          ]"
        >
          {{ filledBadgeLabel }}
        </span>
        <span v-if="solutionKind !== 'brique'" class="fr-badge fr-badge--sm fr-badge--new fr-ml-1w">
          Sans développement
        </span>
      </span>
    </template>
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

type SolutionKind = 'brique' | 'logiciel' | 'portail'

const props = defineProps<{
  title: string
  solutions: SolutionRecord[]
  integrationScorePerSolution: Map<number, { integratedCount: number; totalCount: number }>
  nomFournisseur: string
  typeLabel: string
  solutionKind: SolutionKind
}>()

const badgeIconClass = computed(() => {
  const icons: Record<SolutionKind, string> = {
    brique: 'fr-icon-code-box-fill',
    logiciel: 'fr-icon-mac-fill',
    portail: 'fr-icon-seo-fill',
  }
  return icons[props.solutionKind]
})

const emptyBadgeLabel = computed(() => {
  const labels: Record<SolutionKind, string> = {
    brique: 'Aucune brique',
    logiciel: 'Aucun logiciel',
    portail: 'Aucun portail',
  }
  return labels[props.solutionKind]
})

const filledBadgeLabel = computed(() => {
  const count = props.solutions.length
  const labels: Record<SolutionKind, string> = {
    brique: count > 1 ? 'briques' : 'brique',
    logiciel: count > 1 ? 'logiciels' : 'logiciel',
    portail: count > 1 ? 'portails' : 'portail',
  }
  return `${count} ${labels[props.solutionKind]}`
})
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
