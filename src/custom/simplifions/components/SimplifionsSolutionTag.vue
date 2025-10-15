<template>
  <p
    :class="`fr-badge fr-badge--sm fr-mb-2w fr-badge--no-icon ${isPublic ? 'fr-badge--success' : 'fr-badge--info'}`"
  >
    <span class="font-weight-normal">{{ tagText }}</span>
    <span v-if="operatorName">
      <span class="fr-ml-1v font-weight-normal"> | </span>
      {{ operatorName }}
    </span>
  </p>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import type { TopicSolutionsExtras } from '../model/topics'

const props = defineProps({
  topicSolution: {
    type: Object as () => Topic,
    required: true
  }
})

const solution = computed(
  () =>
    (props.topicSolution.extras as TopicSolutionsExtras | undefined)?.[
      'simplifions-v2-solutions'
    ]
)

const isPublic = computed(() => {
  return solution.value?.Public_ou_prive === 'Public'
})

const tagText = computed(() => {
  return isPublic.value ? 'Solution publique' : 'Solution privée'
})

const operatorName = computed(() => {
  return solution.value?.Nom_de_l_operateur?.[0]
})
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}
</style>
