<script setup lang="ts">
import type { Indicator } from '../../model/indicator'
import { useTags } from '../../utils/indicator'

const EXCLUDE_TAGS = ['producteur']

const props = defineProps({
  indicator: {
    type: Object as () => Indicator | undefined,
    required: true
  },
  type: {
    type: String,
    default: undefined
  }
})

const tags = useTags(props.indicator, props.type, EXCLUDE_TAGS)
</script>

<template>
  <template v-if="tags.length > 0">
    <ul class="fr-badges-group fr-mb-1w">
      <li v-for="t in tags" :key="`${t.type}-${t.value}`">
        <p :class="['fr-badge', `fr-badge--${t.color}`]">
          {{ t.value }}
        </p>
      </li>
    </ul>
  </template>
  <p v-else class="fr-mb-0">-</p>
</template>
