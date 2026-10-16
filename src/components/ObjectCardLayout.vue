<script setup lang="ts">
import type {
  OrganizationReference,
  UserReference
} from '@datagouv/components-next'
import {
  AppLink,
  FormattedDate,
  ObjectCardOwner,
  removeMarkdownSync,
  TranslationT
} from '@datagouv/components-next'
import { RiSubtractLine } from '@remixicon/vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import type { TitleTag } from '@/model'

const props = withDefaults(
  defineProps<{
    url: RouteLocationRaw
    title: string
    icon?: Component
    organization?: OrganizationReference | null
    owner?: UserReference | null
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

// visual truncation is handled by line-clamp, the cap only limits DOM size
const shortDescription = computed(() =>
  removeMarkdownSync((props.showDescription && props.description) || '')
    .trim()
    .slice(0, 500)
)
</script>

<template>
  <!-- mirrors components-next DatasetCard's ObjectCard/ObjectCardHeader markup, which are not exported -->
  <article
    class="fr-px-3w fr-py-2w border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link"
  >
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div v-if="$slots.media" class="flex-none">
        <div
          class="flex justify-center items-center border border-gray-lower bg-[#fff] rounded-md overflow-hidden p-2"
        >
          <slot name="media" />
        </div>
      </div>
      <div class="flex-1 overflow-hidden space-y-1">
        <component :is="titleTag" class="w-full text-base font-bold flex">
          <AppLink
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
          </AppLink>
        </component>
        <div
          v-if="organization || owner"
          class="text-sm flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
        >
          <ObjectCardOwner
            :organization="organization"
            :owner="owner"
            :organization-url="organizationUrl"
          />
          <RiSubtractLine
            class="hidden md:block size-4 flex-none fill-gray-medium"
          />
          <TranslationT
            tag="div"
            class="w-full md:w-auto text-gray-medium whitespace-nowrap"
            keypath="Mis à jour {date}"
          >
            <template #date>
              <FormattedDate
                :date="lastUpdate"
                format="relative"
                :options="{ dateStyle: 'medium' }"
              />
            </template>
          </TranslationT>
        </div>
        <p
          v-if="shortDescription"
          class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:line-clamp-2"
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
/* compensate DSFR badges bottom margin */
.object-card-footer :deep(.fr-badges-group) {
  margin-bottom: -0.5rem;
}
</style>
