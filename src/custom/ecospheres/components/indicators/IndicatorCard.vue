<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'
import type { DatasetV2 } from '@datagouv/components'

const props = defineProps({
  indicator: {
    type: Object as PropType<DatasetV2>,
    required: true
  }
})
</script>

<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title fr-mb-1w">
          <RouterLink
            :to="{ name: 'dataset_detail', params: { did: indicator.id } }"
            >{{ indicator.title }}</RouterLink
          >
        </h3>
        <p class="fr-card__desc">
          <text-clamp
            :auto-resize="true"
            :text="stripFromMarkdown(indicator.description)"
            :max-lines="3"
          />
        </p>
      </div>
    </div>
  </div>
</template>
