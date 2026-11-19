<script setup lang="ts">
import { useDesignSection } from '@/components/design/designSections'

const props = defineProps<{
  id: string
  title: string
  // technical name of the component(s) shown in the section
  component: string
}>()

useDesignSection(props.id, props.title)
</script>

<template>
  <section :id="id" class="fr-mb-6w">
    <h3 class="fr-h5 fr-mb-1w">
      {{ title }}
      <code class="design-section__component">{{ component }}</code>
    </h3>
    <ul class="fr-grid-row fr-grid-row--gutters tiles-list fr-p-0">
      <slot />
    </ul>
  </section>
</template>

<style scoped>
.design-section__component {
  font-size: 0.875rem;
  font-weight: 400;
}
</style>
