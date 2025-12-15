<template>
  <div>
    <!--Texte pour préciser les usagers et les fournisseurs de service-->
    <div v-if="groupedTags['target-users']" class="fr-card__detail">
      <p class="fr-mb-1w white-space-normal">
        Pour simplifier les démarches des
        <HumanReadableList
          :items="groupedTags['target-users'].map((t: ResolvedTag) => t.name)"
        />
      </p>
    </div>
    <div
      v-if="groupedTags['fournisseurs-de-service']"
      class="fr-card__detail fr-text--right"
    >
      <p class="fr-mb-1w white-space-normal">
        À destination des
        <HumanReadableList :items="filteredFournisseursDeService" />
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
import type { ResolvedTag } from '@/model/tag'
import type { Topic } from '@/model/topic'
import { useTagsByRef } from '@/utils/tags'
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

const filteredFournisseursDeService = computed(() => {
  const names = groupedTags.value['fournisseurs-de-service'].map(
    (fn) => fn.name
  )
  const rootElement = 'Tous les acteurs publics'
  const topLevelElements = names
    .filter((name) => {
      return (
        name !== rootElement &&
        // Include generic elements like "Tous les..." and "Etat"
        (name.match(/^Tou(t|s|tes)/) || name === 'État')
      )
    })
    .sort()
  const specificElements = names
    .filter((name) => !topLevelElements.includes(name) && name !== rootElement)
    .sort()
  if (specificElements.length > 0) {
    return specificElements
  } else if (topLevelElements.length > 0) {
    return topLevelElements
  } else {
    return [rootElement]
  }
})
</script>

<style scoped>
.white-space-normal {
  white-space: normal;
}
.font-weight-normal {
  font-weight: normal;
}
</style>
