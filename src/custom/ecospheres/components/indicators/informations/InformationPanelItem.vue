<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import { UNFILLED_LABEL } from '../../../utils/indicator'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: UNFILLED_LABEL
  },
  isRow: {
    type: Boolean,
    default: false
  },
  isMarkdown: {
    type: Boolean,
    default: false
  }
})

const _class = props.isRow ? ['fr-col-12'] : ['fr-col-12', 'fr-col-sm-6']
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div :class="_class">
    <dt class="fr-mb-2v fr-p-0 font-bold">{{ title }}</dt>
    <dd class="fr-p-0 fr-m-0">
      <slot v-if="$slots.default" />
      <div
        v-else-if="isMarkdown"
        class="markdown"
        v-html="fromMarkdown(value).html"
      />
      <p v-else class="fr-m-0">{{ value }}</p>
    </dd>
  </div>
</template>

<style scoped>
dt {
  line-height: 1.25rem;
  color: var(--text-title-grey);
}

:deep(.markdown > p) {
  margin-block-end: 0.5em;
}
</style>
