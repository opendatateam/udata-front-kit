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
  },
  // matches the smaller, muted text style used by @datagouv/components-next's
  // DescriptionList (e.g. on dataset/dataservice info tabs)
  small: {
    type: Boolean,
    default: false
  }
})

const _class = props.isRow ? ['fr-col-12'] : ['fr-col-12', 'fr-col-sm-6']
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div :class="_class">
    <dt class="fr-p-0 font-bold" :class="small ? 'text-sm mb-1' : 'fr-mb-2v'">
      {{ title }}
    </dt>
    <dd class="fr-p-0 fr-m-0" :class="{ 'text-sm text-gray-medium': small }">
      <slot v-if="$slots.default" />
      <div
        v-else-if="isMarkdown"
        class="markdown"
        :class="{ 'markdown--small': small }"
        v-html="fromMarkdown(value).html"
      />
      <p v-else class="fr-m-0" :class="{ 'text-sm': small }">{{ value }}</p>
    </dd>
  </div>
</template>

<style scoped>
/* small variant inherits the muted body text color instead (matches @datagouv/components-next's DescriptionListTerm) */
dt:not(.text-sm) {
  color: var(--text-title-grey);
}

:deep(.markdown > p) {
  margin-block-end: 0.5em;
}

:deep(.markdown--small > p) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
