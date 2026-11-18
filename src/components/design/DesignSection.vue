<script setup lang="ts">
import { useDesignSection } from '@/utils/design/designSections'

const props = defineProps<{
  id: string
  title: string
  description?: string
  // the card can't render on this site: shows a note instead of the examples
  unavailable?: boolean
}>()

if (!props.unavailable) {
  useDesignSection(props.id, props.title)
}
</script>

<template>
  <section :id="id" class="fr-mb-6w">
    <h3 class="fr-h5 fr-mb-1w">{{ title }}</h3>
    <p v-if="unavailable" class="design-section__note fr-text--sm fr-mb-0">
      Non disponible sur ce site.
    </p>
    <template v-else>
      <p v-if="description" class="fr-text--sm fr-mb-2w">{{ description }}</p>
      <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-p-0">
        <slot />
      </ul>
    </template>
  </section>
</template>

<style scoped>
.design-section__note {
  color: var(--text-mention-grey);
}
</style>
