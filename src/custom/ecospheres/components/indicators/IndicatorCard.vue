<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'
import type { Indicator } from '../../model/indicator'
import { useTags } from '../../utils/indicator'

const props = defineProps({
  indicator: {
    type: Object as PropType<Indicator>,
    required: true
  }
})

const tags = useTags(props.indicator)
</script>

<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <ul class="fr-badges-group fr-mb-1w">
          <li v-for="tag in tags" :key="`${tag.type}-${tag.value}`">
            <p :class="['fr-badge', `fr-badge--${tag.color}`]">
              {{ tag.value }}
            </p>
          </li>
        </ul>
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
