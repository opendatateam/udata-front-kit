<script setup lang="ts">
import {
  OrganizationNameWithCertificate,
  useFormatDate
} from '@datagouv/components-next'
import type { RouteLocationRaw } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useOwnerName } from '@/utils/owned'

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  }
})

const { formatRelativeIfRecentDate } = useFormatDate()
const { pageKey, pageConf } = useCurrentPageConf()

const ownerName = useOwnerName(props.topic)

const topicLink: RouteLocationRaw = {
  name: `${pageKey}_detail`,
  params: { item_id: props.topic.slug }
}
</script>

<template>
  <article class="fr-px-3w fr-py-2w border border-default-grey fr-enlarge-link">
    <div
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p class="fr-badge fr-badge--sm fr-badge--mention-grey fr-mr-1w">
        <span class="fr-icon-plant-line fr-icon--sm" aria-hidden="true"></span>
        {{ pageConf.labels.singular }}
      </p>
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

    <p class="fr-mb-2v fr-text--sm flex align-center fr-pt-3v text-grey-380">
      <VIconCustom
        name="time-line"
        class="fr-mr-1w text-grey-380 fr-icon--sm"
      />
      Mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
    </p>
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
</style>
