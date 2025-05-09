<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { computed } from 'vue'

import { useCurrentPageConf } from '@/router/utils'
import { stripFromMarkdown } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useOwnerName } from '@/utils/dataset'

const { pageConf } = useCurrentPageConf()

const props = defineProps({
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  },
  alreadySelected: {
    type: Boolean,
    required: false,
    default: false
  },
  badgePosition: {
    type: String as () => 'relative' | 'absolute' | 'sr-only',
    required: false,
    default: 'relative'
  }
})

const ownerName = useOwnerName(props.dataset)

const thumbnail = computed(() => {
  if (props.dataset.organization)
    return props.dataset.organization.logo_thumbnail
  return getOwnerAvatar(props.dataset)
})

const badgeClasse = computed(() => {
  let classes: string = ''
  switch (props.badgePosition) {
    case 'relative':
      classes = 'relative fr-mb-2v'
      break
    case 'absolute':
      classes = 'absolute top-0 fr-mt-n4v'
      break
    case 'sr-only':
      classes = 'fr-sr-only'
      break
  }
  return classes
})
</script>

<template>
  <div class="card">
    <DsfrBadge
      v-if="alreadySelected"
      type="info"
      :label="`Déjà utilisé dans ce ${pageConf.labels.singular}`"
      small
      ellipsis
      :class="badgeClasse"
    />
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <div class="logo">
          <img :src="thumbnail" alt="" loading="lazy" width="60" height="60" />
        </div>
      </div>
      <div class="fr-col">
        <h4 class="fr-mb-1v fr-grid-row">
          {{ dataset.title }}
          <small v-if="dataset.acronym">{{ dataset.acronym }}</small>
        </h4>
        <p
          v-if="dataset.organization || dataset.owner"
          class="fr-m-0 fr-text--xs org--fix"
        >
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

<style scoped>
h4 {
  font-size: 1rem;
}
</style>
