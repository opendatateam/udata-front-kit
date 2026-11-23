<script setup lang="ts">
import { useDesignGroup } from '@/components/design/designSections'

const props = defineProps<{
  id: string
  title: string
}>()

useDesignGroup(props.id, props.title)
</script>

<template>
  <h2 :id="id" class="fr-h3">{{ title }}</h2>
  <slot />
</template>
