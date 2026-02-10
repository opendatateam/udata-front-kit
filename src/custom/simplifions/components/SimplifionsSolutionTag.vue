<template>
  <p
    :class="`fr-badge fr-badge--sm fr-badge--no-icon ${isPublic ? 'fr-badge--brown-cafe-creme' : 'fr-badge--info'}`"
  >
    <span class="font-weight-normal text-uppercase">{{ tagText }}</span>
    <span v-if="operatorName">
      <span class="fr-ml-1v font-weight-normal"> | </span>
      <span class="text-uppercase">{{ operatorName }}</span>
    </span>
  </p>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import type { Solution } from '../model/grist'
import type { TopicSolutionsExtras } from '../model/topics'

const props = defineProps<{
  topicSolution?: Topic
  solution?: Solution
}>()

const solutionData = computed(() => {
  if (props.solution) {
    return props.solution
  }
  if (props.topicSolution) {
    return (props.topicSolution.extras as TopicSolutionsExtras | undefined)?.[
      'simplifions-v2-solutions'
    ]
  }
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
