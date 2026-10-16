<script setup lang="ts">
import {
  Avatar,
  OrganizationLogo,
  Placeholder
} from '@datagouv/components-next'
import { RiBookShelfLine } from '@remixicon/vue'
import { computed, toRef } from 'vue'
import { type RouteLocationRaw } from 'vue-router'

import ObjectCardLayout from '@/components/ObjectCardLayout.vue'
import TagComponent from '@/components/TagComponent.vue'
import VIconDsfr from '@/components/VIconDsfr.vue'
import type { TitleTag } from '@/model'
import type { Topic } from '@/model/topic'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTags } from '@/utils/tags'
import { useTopicFactors } from '@/utils/topic'

const props = defineProps({
  pageKey: {
    type: String,
    default: 'topics'
  },
  topic: {
    type: Object as () => Topic,
    required: true
  },
  topicUrl: {
    type: Object as () => RouteLocationRaw,
    default: null
  },
  showDescription: {
    type: Boolean,
    default: true
  },
  // theme tags and data/coverage pills
  showTags: {
    type: Boolean,
    default: true
  },
  titleTag: {
    type: String as () => TitleTag,
    default: 'h3'
  }
})

const topicRef = toRef(props, 'topic')
const spatialCoverage = useSpatialCoverage(topicRef)
const { nbFactors } = useTopicFactors(topicRef)

const topicLink = computed<RouteLocationRaw>(
  () =>
    props.topicUrl ?? {
      name: `${props.pageKey}_detail`,
      params: { item_id: props.topic.slug }
    }
)

const tags = useTags(props.pageKey, props.topic)
</script>

<template>
  <ObjectCardLayout
    :url="topicLink"
    :title="topic.name"
    :icon="RiBookShelfLine"
    :organization="topic.organization"
    :owner="topic.owner"
    :organization-url="null"
    :last-update="topic.last_modified"
    :description="topic.description"
    :show-description="showDescription"
    :title-tag="titleTag"
  >
    <template #media>
      <OrganizationLogo
        v-if="topic.organization"
        :organization="topic.organization"
        size-class="size-12"
      />
      <Avatar v-else-if="topic.owner" :user="topic.owner" :size="48" />
      <Placeholder v-else type="Topic" class="size-12" />
    </template>
    <template v-if="showTags" #footer>
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
  </ObjectCardLayout>
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
