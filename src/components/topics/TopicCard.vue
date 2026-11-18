<script setup lang="ts">
import {
  Avatar,
  OrganizationLogo,
  Placeholder
} from '@datagouv/components-next'
import { RiBookShelfLine } from '@remixicon/vue'
import { computed } from 'vue'
import { type RouteLocationRaw } from 'vue-router'

import ObjectCardLayout from '@/components/ObjectCardLayout.vue'
import type { TitleTag } from '@/model'
import type { Topic } from '@/model/topic'
import TopicCardFooter from './TopicCardFooter.vue'

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

const topicLink = computed<RouteLocationRaw>(
  () =>
    props.topicUrl ?? {
      name: `${props.pageKey}_detail`,
      params: { item_id: props.topic.slug }
    }
)
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
      <TopicCardFooter :page-key="pageKey" :topic="topic" />
    </template>
  </ObjectCardLayout>
</template>
