<script setup lang="ts">
import type {
  OrganizationReference,
  UserReference
} from '@datagouv/components-next'
import {
  getOwnerName,
  OrganizationNameWithCertificate,
  useFormatDate
} from '@datagouv/components-next'
import { RiSubtractLine } from '@remixicon/vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import type { TitleTag } from '@/model'
import { stripFromMarkdown } from '@/utils'

const props = withDefaults(
  defineProps<{
    url: RouteLocationRaw
    title: string
    icon?: Component
    organization?: OrganizationReference | null
    owner?: UserReference | null
    // not rendered yet: the organization name is plain text until the cards redesign
    organizationUrl?: RouteLocationRaw | null
    lastUpdate: string
    description?: string | null
    showDescription?: boolean
    titleTag?: TitleTag
  }>(),
  {
    icon: undefined,
    organization: undefined,
    owner: undefined,
    organizationUrl: undefined,
    description: undefined,
    showDescription: true,
    titleTag: 'h3'
  }
)

const { formatRelativeIfRecentDate } = useFormatDate()

// visual truncation is handled by line-clamp, the cap only limits DOM size
const shortDescription = computed(() =>
  props.showDescription && props.description
    ? stripFromMarkdown(props.description, 500).trim()
    : ''
)

const ownerName = computed(() =>
  props.owner ? getOwnerName({ organization: null, owner: props.owner }) : ''
)
</script>

<template>
  <!-- mirrors components-next 1.4.0 DatasetCard markup (ObjectCard/ObjectCardHeader), not exported -->
  <article
    class="fr-px-3w fr-py-2w border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link"
  >
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div v-if="$slots.media" class="flex-none">
        <div
          class="object-card-media flex justify-center items-center border bg-white rounded-md overflow-hidden p-2"
        >
          <slot name="media" />
        </div>
      </div>
      <div class="flex-1 overflow-hidden space-y-1">
        <component :is="titleTag" class="w-full text-base font-bold flex">
          <RouterLink
            :to="url"
            class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
          >
            <component
              :is="icon"
              v-if="icon"
              aria-hidden="true"
              class="size-4 flex-none"
            />
            <span class="block truncate flex-1">{{ title }}</span>
            <span class="absolute inset-0" />
          </RouterLink>
        </component>
        <div
          v-if="organization || owner"
          class="text-sm flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
        >
          <!-- inlined components-next 1.4.0 ObjectCardOwner, its 1.5.0 markup breaks this one-line layout -->
          <div v-if="organization" class="flex-initial truncate">
            <span class="text-sm overflow-hidden flex items-center truncate">
              <OrganizationNameWithCertificate
                :organization="organization"
                size="sm"
                color-class="text-gray-title"
              />
            </span>
          </div>
          <div v-else-if="ownerName" class="mr-1 truncate">
            {{ ownerName }}
          </div>
          <RiSubtractLine
            class="hidden md:block size-4 flex-none fill-gray-medium"
          />
          <div class="object-card-date text-gray-medium whitespace-nowrap">
            Mis à jour
            {{
              formatRelativeIfRecentDate(lastUpdate, { dateStyle: 'medium' })
            }}
          </div>
        </div>
        <p
          v-if="shortDescription"
          class="object-card-description fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere"
        >
          {{ shortDescription }}
        </p>
        <div v-if="$slots.footer" class="fr-mt-2w object-card-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* replace utilities no longer shipped by components-next 1.5.0 CSS */
.object-card-media {
  border-color: var(--color-gray-lower);
}

.object-card-date {
  width: 100%;
}

.object-card-description {
  display: none;
}

@media (min-width: 640px) {
  .object-card-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }
}

@media (min-width: 768px) {
  .object-card-date {
    width: auto;
  }
}

/* compensate DSFR badges bottom margin */
.object-card-footer :deep(.fr-badges-group) {
  margin-bottom: -0.5rem;
}
</style>
