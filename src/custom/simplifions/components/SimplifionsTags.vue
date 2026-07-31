<template>
  <div>
    <!--Texte pour préciser les usagers et les fournisseurs de service-->
    <div
      v-if="showTargetUsers && groupedTags['target-users']"
      class="fr-card__detail"
    >
      <p class="fr-mb-1w white-space-normal">
        Pour simplifier les démarches des
        <HumanReadableList
          :items="groupedTags['target-users'].map((t) => t.name)"
        />
      </p>
    </div>
    <div
      v-if="showFournisseurs && orderedFournisseursDeService.length > 0"
      class="fr-card__detail fr-text--right"
    >
      <p class="fr-mb-1w white-space-normal">
        À destination
        {{ orderedFournisseursDeService[0].startsWith('Tou') ? 'de' : 'des' }}
        <HumanReadableList :items="orderedFournisseursDeService" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTagsByRef } from '@/utils/tags'
import type { TopicCasUsage, TopicSolution } from '../model/topics'
import HumanReadableList from './HumanReadableList.vue'

const props = withDefaults(
  defineProps<{
    topic: TopicCasUsage | TopicSolution
    pageKey: string
    showTargetUsers?: boolean
    showFournisseurs?: boolean
  }>(),
  {
    showTargetUsers: true,
    showFournisseurs: true
  }
)

const topicRef = ref(props.topic)
const tags = useTagsByRef(props.pageKey, topicRef)

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

const orderedFournisseursDeService = computed(() => {
  const extras = props.topic.extras
  const extrasForObject =
    'simplifions-v2-cas-d-usages' in extras
      ? extras['simplifions-v2-cas-d-usages']
      : extras['simplifions-v2-solutions']
  return extrasForObject?.A_destination_de?.map((v) => v.label).sort() || []
})
</script>

<style scoped>
.white-space-normal {
  white-space: normal;
}
</style>
