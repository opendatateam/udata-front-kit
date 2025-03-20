<script setup lang="ts">
import type { Indicator } from '../../model/indicator'
import { UNFILLED_LABEL, useTags } from '../../utils/indicator'

const EXCLUDE_TAGS = ['usage']

const props = defineProps({
  indicator: {
    type: Object as () => Indicator | undefined,
    required: true
  },
  type: {
    type: String,
    default: undefined
  },
  showDefaultValue: {
    type: Boolean,
    default: true
  }
})

const tags = useTags(props.indicator, props.type, EXCLUDE_TAGS)
</script>

<template>
  <ul v-if="tags.length > 0" class="fr-badges-group fr-mb-1w">
    <li v-for="t in tags" :key="`${t.type}-${t.value}`">
      <p :class="['fr-badge', `fr-badge--${t.color}`]">
        {{ t.value }}
      </p>
    </li>
  </ul>
  <p v-else-if="showDefaultValue" class="fr-mb-0">{{ UNFILLED_LABEL }}</p>
</template>
