<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'
import type { Indicator } from '../../model/indicator'
import IndicatorTags from './IndicatorTags.vue'

defineProps({
  dataset: {
    type: Object as PropType<Indicator>,
    required: true
  }
})
</script>

<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <IndicatorTags :indicator="dataset" :show-default-value="false" />
        <h3 class="fr-card__title fr-mb-1w">
          <RouterLink
            :to="{ name: 'indicators_detail', params: { item_id: dataset.id } }"
            >{{ dataset.title }}</RouterLink
          >
        </h3>
        <p class="fr-card__desc">
          <text-clamp
            :auto-resize="true"
            :text="stripFromMarkdown(dataset.description)"
            :max-lines="3"
          />
        </p>
      </div>
    </div>
  </div>
</template>
