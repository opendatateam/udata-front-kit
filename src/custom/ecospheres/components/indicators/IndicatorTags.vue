<script setup lang="ts">
import TagComponent from '@/components/TagComponent.vue'
import type { Indicator } from '../../model/indicator'
import { useIndicatorTags } from '../../utils/indicator'

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

const tags = useIndicatorTags(props.indicator, props.type)
</script>

<template>
  <ul v-if="tags.length > 0" class="fr-badges-group">
    <li v-for="t in tags" :key="`${t.type}-${t.id}`">
      <TagComponent :tag="t" />
    </li>
  </ul>
</template>
