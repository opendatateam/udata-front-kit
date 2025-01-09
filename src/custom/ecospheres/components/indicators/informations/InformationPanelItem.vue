<script setup lang="ts">
import { fromMarkdown } from '@/utils'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: '-'
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
  <div :class="_class">
    <h3 class="subtitle fr-mb-2v">{{ title }}</h3>
    <slot v-if="$slots.default"></slot>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else-if="isMarkdown"
      class="fr-m-0"
      v-html="fromMarkdown(value)"
    ></div>
    <p v-else class="fr-m-0">{{ value }}</p>
  </div>
</template>
