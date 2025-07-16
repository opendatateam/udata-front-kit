<template>
  <div class="topic-card">
    <RouterLink :to="topicLink">
      <div class="header-topic">
        <div class="title-topic">{{ topic.name }}</div>
        <div class="author-topic">
          <template v-if="topic.organization">
            <OrganizationNameWithCertificate
              :organization="topic.organization"
            />
          </template>
          <template v-else>{{ ownerName }}</template>
        </div>
        <div class="date-topic">
          mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
        </div>
      </div>
      <div class="description-topic">
        <p class="fr-mb-1v">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
        </p>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import {
  formatRelativeIfRecentDate,
  OrganizationNameWithCertificate,
  useOwnerName
} from '@datagouv/components'

import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { stripFromMarkdown } from '@/utils'
import type { RouteLocationRaw } from 'vue-router'

const { pageKey } = useCurrentPageConf()

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  }
})

const ownerName = useOwnerName(props.topic)

const topicLink: RouteLocationRaw = {
  name: `${pageKey}_detail`,
  params: { item_id: props.topic.slug }
}
</script>


<style scoped>
.owner-avatar {
  margin-bottom: -6px;
  display: inline-block;
}
.fr-card__detail,
:deep(h3) {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: inherit;
}
.topic-card-col-logo {
  max-width: 4.25rem;
}
.description p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.topic-card {
  border: 1px solid #ebebeb;
}
.topic-card:hover {
  background-color: #f6f6f6;
  opacity: 50;
}
.header-topic {
  background-color: rgba(209, 221, 244, 0.5);
  color: #465f9d;
  padding: 16px;
  gap: 10px;
  opacity: 0px;
  min-height: 60px;
}
.title-topic {
  font-family: Marianne;
  font-size: 18px;
  font-weight: 800;
  line-height: 27px;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  margin-bottom: 10px;
}
.author-topic {
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
}
.date-topic {
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
}
.description-topic {
  margin: 16px;
  min-height: 80px;
}
</style>
