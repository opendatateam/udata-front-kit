<script setup lang="ts">
import {
  AppLink,
  FormattedDate,
  ObjectCardOwner,
  removeMarkdownSync,
  TranslationT
} from '@datagouv/components-next'
import { RiBarChart2Line, RiSubtractLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Indicator } from '../../model/indicator'
import IndicatorTags from './IndicatorTags.vue'

const props = defineProps<{
  dataset: Indicator
  // declared to avoid attribute fallthrough, the slug-based url below is used instead
  datasetUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw | null
}>()

const url = computed(() => ({
  name: 'indicators_detail',
  params: { item_id: props.dataset.slug }
}))

// visual truncation is handled by line-clamp, the cap only limits DOM size
const description = computed(() =>
  removeMarkdownSync(props.dataset.description ?? '')
    .trim()
    .slice(0, 500)
)
</script>

<template>
  <!-- mirrors DatasetCard's ObjectCard/ObjectCardHeader markup, which components-next does not export -->
  <article
    class="fr-px-3w fr-py-2w border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link space-y-1"
  >
    <h3 class="w-full text-base font-bold flex">
      <AppLink
        :to="url"
        class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
      >
        <RiBarChart2Line aria-hidden="true" class="size-4 flex-none" />
        <span class="block truncate flex-1">{{ dataset.title }}</span>
        <span class="absolute inset-0" />
      </AppLink>
    </h3>
    <div
      v-if="dataset.organization || dataset.owner"
      class="text-sm flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="dataset.organization"
        :owner="dataset.owner"
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
            :date="dataset.last_update"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
    </div>
    <p
      class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:line-clamp-2"
    >
      {{ description }}
    </p>
    <IndicatorTags :indicator="dataset" class="fr-mt-2w card-tags" />
  </article>
</template>

<style scoped>
/* compensate DSFR badges bottom margin */
.card-tags {
  margin-bottom: -0.5rem;
}
</style>
