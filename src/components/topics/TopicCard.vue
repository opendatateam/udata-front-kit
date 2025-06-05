<script setup lang="ts">
import {
  formatRelativeIfRecentDate,
  OrganizationNameWithCertificate,
  useOwnerName
} from '@datagouv/components'
import { toRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import { stripFromMarkdown } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTags } from '@/utils/tags'
import { useTopicElements } from '@/utils/topic'

const props = defineProps({
  pageKey: {
    type: String,
    default: 'topics'
  },
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
const { nbElements } = useTopicElements(topicRef)

const ownerName = useOwnerName(props.topic)

const topicLink: RouteLocationRaw = {
  name: `${props.pageKey}_detail`,
  params: { item_id: props.topic.slug }
}

const tags = useTags(props.pageKey, props.topic)
</script>

<template>
  <article class="fr-px-3w fr-py-2w border border-default-grey fr-enlarge-link">
    <div
      v-if="topic.private"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v"
    >
      <p class="fr-badge fr-badge--mention-grey fr-mr-1w">Brouillon</p>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <ul v-if="tags.length > 0" class="fr-badges-group fr-mb-1w">
          <li v-for="t in tags" :key="`${t.type}-${t.id}`">
            <TagComponent :tag="t" />
          </li>
        </ul>
      </div>
    </div>
    <div
      class="fr-mt-2v fr-grid-row align-center flex-nowrap flex-gap owner-info"
    >
      <OrganizationLogo v-if="topic.organization" :size="42" :object="topic" />

      <img
        v-else
        :src="getOwnerAvatar(topic)"
        alt=""
        loading="lazy"
        class="border fr-p-1-5v owner-avatar"
        height="56"
        width="56"
      />

      <div class="overflow-hidden flex-1-1-auto">
        <h3 class="fr-mb-1v fr-grid-row h4">
          <RouterLink :to="topicLink" class="text-grey-500">
            {{ topic.name }}
          </RouterLink>
        </h3>
        <p
          v-if="topic.organization || topic.owner"
          class="fr-m-0 fr-text--sm org--fix"
        >
          <template v-if="topic.organization">
            <OrganizationNameWithCertificate
              :organization="topic.organization"
            />
          </template>
          <template v-else>{{ ownerName }}</template>
        </p>
      </div>
    </div>
    <div v-if="!hideDescription" class="fr-grid-row description fr-mt-3v">
      <p class="fr-mb-1v">{{ stripFromMarkdown(topic.description) }}</p>
    </div>

    <p class="fr-mb-2v fr-text--sm flex align-center fr-pt-3v text-grey-380">
      <VIconCustom
        name="time-line"
        class="fr-mr-1w text-grey-380 fr-icon--sm"
      />
      Mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
    </p>

    <div class="fr-grid-row flex-gap">
      <span class="fr-tag">
        <VIconCustom
          name="database-line"
          class="fr-mr-1v"
          size="lg"
          align="text-top"
        />
        <span class="fr-mr-1v">
          {{
            `${nbElements > 0 ? nbElements : 'Aucune'} donnée${nbElements > 1 ? 's' : ''}`
          }}
        </span>
      </span>

      <span v-if="spatialCoverage" class="fr-tag">
        <VIconCustom
          name="road-map-line"
          class="fr-mr-1v"
          size="lg"
          align="text-top"
        />
        <span class="fr-mr-1v">
          {{ spatialCoverage.name }}
        </span>
      </span>
    </div>
  </article>
</template>

<style scoped>
article {
  background-color: var(--background-default-grey);
}
.owner-info {
  --gap: 0.75rem;
  .fr-text--sm {
    line-height: 1.4 !important;
  }
  & > :first-child {
    flex: 0 0 auto;
  }
}
.owner-avatar {
  background-color: #fff;
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

.description p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
