<template>
  <div>
    <!--Texte pour préciser les usagers et les fournisseurs de service-->
    <div v-if="groupedTags['target-users']" class="fr-card__detail">
      <p class="fr-mb-1w white-space-normal">
        Pour simplifier les démarches des
        <HumanReadableList
          :items="groupedTags['target-users'].map((t) => t.name)"
        />
      </p>
    </div>
    <div
      v-if="orderedFournisseursDeService.length > 0"
      class="fr-card__detail fr-text--right"
    >
      <p class="fr-mb-1w white-space-normal">
        À destination
        {{ orderedFournisseursDeService[0].startsWith('Tou') ? 'de' : 'des' }}
        <HumanReadableList :items="orderedFournisseursDeService" />
      </p>
    </div>
    <!-- Tags indiquant le type de simplification et de budget -->
    <div
      v-if="!hideSimplification && groupedTags['types-de-simplification']"
      class="simplification-group fr-mt-2w"
    >
      <ul class="fr-badges-group">
        <li v-for="t in groupedTags['types-de-simplification']" :key="t.id">
          <TagComponent :tag="t" />
        </li>
      </ul>
    </div>
    <div v-if="!hideBudget && groupedTags['budget']" class="budget-group">
      <ul class="fr-badges-group">
        <li v-for="t in groupedTags['budget']" :key="t.id">
          <TagComponent :tag="t" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import { useTagsByRef } from '@/utils/tags'
import type {
  TopicCasUsagesExtras,
  TopicSolutionsExtras
} from '../model/topics'
import HumanReadableList from './HumanReadableList.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
  hideBudget?: boolean
  hideSimplification?: boolean
}>()

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

const hideBudget = computed(() => props.hideBudget)
const hideSimplification = computed(() => props.hideSimplification)

const orderedFournisseursDeService = computed(() => {
  const extras = props.topic.extras as
    | TopicCasUsagesExtras
    | TopicSolutionsExtras
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
