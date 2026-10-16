<script setup lang="ts">
import TagComponent from '@/components/TagComponent.vue'
import type { ResolvedTag } from '@/model/tag'

defineProps<{
  tags: ResolvedTag[]
}>()
</script>

<template>
  <ul v-if="tags.length > 0" class="fr-badges-group">
    <li v-for="t in tags" :key="`${t.type}-${t.id}`">
      <TagComponent :tag="t" />
    </li>
  </ul>
</template>
