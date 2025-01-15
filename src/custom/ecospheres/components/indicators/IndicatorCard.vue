<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'
import type { Indicator } from '../../model/indicator'
import IndicatorTags from './IndicatorTags.vue'

defineProps({
  indicator: {
    type: Object as PropType<Indicator>,
    required: true
  }
})
</script>

<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <IndicatorTags :indicator="indicator" :show-default-value="false" />
        <h3 class="fr-card__title fr-mb-1w">
          <RouterLink
            :to="{ name: 'indicator_detail', params: { iid: indicator.id } }"
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
