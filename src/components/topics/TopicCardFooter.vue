<script setup lang="ts">
import { toRef } from 'vue'

import TagComponent from '@/components/TagComponent.vue'
import VIconDsfr from '@/components/VIconDsfr.vue'
import type { Topic } from '@/model/topic'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTags } from '@/utils/tags'
import { useTopicFactors } from '@/utils/topic'

const props = defineProps<{
  pageKey: string
  topic: Topic
}>()

const topicRef = toRef(props, 'topic')
const spatialCoverage = useSpatialCoverage(topicRef)
const { nbFactors } = useTopicFactors(topicRef)

const tags = useTags(props.pageKey, props.topic)
</script>

<template>
  <ul class="fr-badges-group">
    <li v-for="t in tags" :key="`${t.type}-${t.id}`">
      <TagComponent :tag="t" />
    </li>
    <li>
      <p class="fr-tag topic-pill">
        <VIconDsfr name="database-line" class="fr-mr-1v" small />
        {{
          `${nbFactors > 0 ? nbFactors : 'Aucune'} donnée${nbFactors > 1 ? 's' : ''}`
        }}
      </p>
    </li>
    <li v-if="spatialCoverage">
      <p class="fr-tag topic-pill">
        <VIconDsfr name="road-map-line" class="fr-mr-1v" small />
        {{ spatialCoverage.name }}
      </p>
    </li>
  </ul>
</template>

<style scoped>
/* same shape and spacing as TagComponent badges in a badges group */
.topic-pill {
  margin: 0 0.25rem 0.5rem;
  min-height: auto;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: inherit;
  text-transform: none;
  font-size: 0.75rem;
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-weight: 400;
}
</style>
