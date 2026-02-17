<script setup lang="ts">
import {
  OrganizationNameWithCertificate,
  useFormatDate,
  type Dataservice
} from '@datagouv/components-next'
import type { RouteLocationRaw } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import { getOwnerAvatar } from '@/utils/avatar'
import { useOwnerName } from '@/utils/owned'

const props = defineProps({
  dataservice: {
    type: Object as () => Dataservice,
    required: true
  }
})

const { formatRelativeIfRecentDate } = useFormatDate()

const ownerName = useOwnerName(props.dataservice)

const dataserviceLink: RouteLocationRaw = {
  name: 'dataservices_detail',
  params: { item_id: props.dataservice.id }
}
</script>

<template>
  <article class="fr-px-3w fr-py-2w border border-default-grey fr-enlarge-link">
    <div
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p class="fr-badge fr-badge--sm fr-badge--mention-grey fr-mr-1w">
        <span
          class="fr-icon-terminal-line fr-icon--sm"
          aria-hidden="true"
        ></span>
        API
      </p>
    </div>
    <div
      class="fr-mt-2v fr-grid-row align-center flex-nowrap flex-gap owner-info"
    >
      <OrganizationLogo
        v-if="dataservice.organization"
        :size="42"
        :object="dataservice"
      />

      <img
        v-else
        :src="getOwnerAvatar(dataservice)"
        alt=""
        loading="lazy"
        class="border fr-p-1-5v owner-avatar"
        height="56"
        width="56"
      />

      <div class="overflow-hidden flex-1-1-auto">
        <h3 class="fr-mb-1v fr-grid-row h4">
          <RouterLink :to="dataserviceLink" class="text-grey-50">
            {{ dataservice.title }}
          </RouterLink>
        </h3>
        <p
          v-if="dataservice.organization || dataservice.owner"
          class="fr-m-0 fr-text--sm org--fix"
        >
          <template v-if="dataservice.organization">
            <OrganizationNameWithCertificate
              :organization="dataservice.organization"
            />
          </template>
          <template v-else>{{ ownerName }}</template>
        </p>
      </div>
    </div>

    <p class="fr-mb-2v fr-text--sm flex align-center fr-pt-3v text-grey-425">
      <VIconCustom
        name="time-line"
        class="fr-mr-1w text-grey-425 fr-icon--sm"
      />
      Mis à jour
      {{ formatRelativeIfRecentDate(dataservice.metadata_modified_at) }}
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
