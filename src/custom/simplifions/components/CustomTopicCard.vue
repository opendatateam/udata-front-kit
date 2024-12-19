<script setup lang="ts">
import {
  formatRelativeIfRecentDate,
  OrganizationNameWithCertificate,
  useOwnerName
} from '@datagouv/components'
import { toRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import type { Topic } from '@/model/topic'
import { stripFromMarkdown } from '@/utils'
import { useSearchPagesConfig } from '@/utils/config'
import { useSpatialCoverage } from '@/utils/spatial'
import { useExtras } from '@/utils/topic'

const route = useRoute()
const { searchPageSlug, searchPageExtrasKey } = useSearchPagesConfig(
  route.path.replace('/admin', '').split('/')[1]
)

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  },
  hideDescription: {
    type: Boolean,
    default: false
  }
})

const topicRef = toRef(props, 'topic')
const spatialCoverage = useSpatialCoverage(topicRef)

const ownerName = useOwnerName(props.topic)

const { datasetsProperties } = useExtras(topicRef, searchPageExtrasKey)

const nbData: number = datasetsProperties.value.length

const topicLink: RouteLocationRaw = {
  name: `${searchPageSlug}_detail`,
  params: { bid: props.topic.slug }
}
</script>

<template>
  <div>
    <div class="topic-card">
      <RouterLink :to="topicLink">
        <div class="header-topic">
          <div
            v-if="topic.private"
            class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v"
          >
            <span class="fr-badge fr-badge--mention-grey fr-mr-1w"
              >Brouillon</span
            >
          </div>
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
      </RouterLink>
      <div class="description-topic">
        <p class="fr-mb-1v">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
        </p>
      </div>
    </div>
  </div>
</template>

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
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.topic-card {
  border: 1px solid #ebebeb;
}
.header-topic {
  background-color: #e6eefe;
  color: #465f9d;
  padding: 16px;
  gap: 10px;
  opacity: 0px;
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
  min-height: 60px;
}
.header-topic:hover {
  background-color: #ebebeb;
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
