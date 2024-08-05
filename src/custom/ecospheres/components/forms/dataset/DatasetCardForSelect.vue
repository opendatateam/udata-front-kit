<script setup lang="ts">
import {
  type DatasetV2,
  useOwnerName,
  OrganizationNameWithCertificate
} from '@datagouv/components'
import { computed } from 'vue'

import { stripFromMarkdown } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'

const props = defineProps({
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  }
})

const ownerName = useOwnerName(props.dataset)

const thumbnail = computed(() => {
  if (props.dataset.organization)
    return props.dataset.organization.logo_thumbnail
  return getOwnerAvatar(props.dataset)
})
</script>

<template>
  <div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <div class="logo">
          <img :src="thumbnail" width="60" height="60" />
        </div>
      </div>
      <div class="fr-col">
        <h4 class="fr-mb-1v fr-grid-row">
          {{ dataset.title }}
          <small v-if="dataset.acronym">{{ dataset.acronym }}</small>
        </h4>
        <p
          v-if="dataset.organization || dataset.owner"
          class="fr-m-0 fr-text--xs"
        >
          Par
          <template v-if="dataset.organization">
            <OrganizationNameWithCertificate
              :organization="dataset.organization"
            />
          </template>
          <template v-else>{{ ownerName }}</template>
        </p>
        <p
          class="fr-mt-1w fr-mb-1w fr-hidden fr-unhidden-sm overflow-wrap-anywhere fr-text--sm"
        >
          <text-clamp
            :auto-resize="true"
            :text="stripFromMarkdown(dataset.description)"
            :max-lines="2"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h4 {
  font-size: 1rem;
}
</style>
