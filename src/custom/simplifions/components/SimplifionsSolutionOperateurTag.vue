<template>
  <p
    :class="`fr-badge fr-badge--sm fr-badge--no-icon ${isPublic ? 'fr-badge--brown-cafe-creme' : 'fr-badge--info'}`"
  >
    <span class="font-weight-normal"
      >{{ tagText }} | <b>{{ operatorName }}</b></span
    >
  </p>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import type { Solution } from '../model/grist'
import type { TopicSolutionsExtras } from '../model/topics'

const props = defineProps<{
  topicSolution?: Topic
  gristSolution?: Solution
}>()

const solutionData = computed(() => {
  if (props.gristSolution) {
    return props.gristSolution
  }
  if (props.topicSolution) {
    return (props.topicSolution.extras as TopicSolutionsExtras | undefined)?.[
      'simplifions-v2-solutions'
    ]
  }
  console.warn('No solution passed to SimplifionsSolutionTag')
  return undefined
})

const isPublic = computed(() => {
  return solutionData.value?.Public_ou_prive === 'Public'
})

const tagText = computed(() => {
  return isPublic.value ? 'Solution publique' : 'Solution privée'
})

const operatorName = computed(() => {
  return solutionData.value?.Nom_de_l_operateur?.[0]
})
</script>
