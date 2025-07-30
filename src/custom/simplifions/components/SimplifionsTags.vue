<template>
  <div>
    <!--Texte pour préciser les usagers et les fournisseurs de service-->
    <div v-if="groupedTags['target-users']" class="fr-card__detail">
      <p class="fr-mb-1w white-space-normal">
        Démarches des
        <span
          v-for="(t, index) in groupedTags['target-users']"
          :key="t.id"
          class="tag-item"
        >
          <span class="font-bold">{{ t.name }}</span>
          <span
            v-if="index < groupedTags['target-users'].length - 1"
            class="fr-mx-1v font-weight-normal"
            >|</span
          >
        </span>
      </p>
    </div>
    <div
      v-if="groupedTags['fournisseurs-de-service']"
      class="fr-card__detail fr-text--right"
    >
      <p class="fr-mb-1w white-space-normal">
        À destination des
        <span
          v-for="(t, index) in groupedTags['fournisseurs-de-service']"
          :key="t.id"
          class="tag-item"
        >
          <span class="font-bold">{{ t.name }}</span>
          <span
            v-if="index < groupedTags['fournisseurs-de-service'].length - 1"
            class="fr-mx-1v font-weight-normal"
            >|</span
          >
        </span>
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
</script>

<style scoped>
.white-space-normal {
  white-space: normal;
}
.font-weight-normal {
  font-weight: normal;
}
</style>
