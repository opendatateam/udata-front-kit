<template>
  <div
    v-if="columns.length === 0"
    class="content-placeholder"
    :style="{ minHeight }"
  ></div>
  <div v-else class="fr-grid-row fr-grid-row--gutters">
    <div v-for="(col, index) in columns" :key="index" :class="col">
      <div class="content-placeholder" :style="{ minHeight }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * A placeholder component for loading states.
 *
 * @example
 * <!-- Default 8/4 column layout -->
 * <ContentPlaceholder />
 *
 * <!-- Single full-width block -->
 * <ContentPlaceholder :columns="[]" />
 *
 * <!-- Three equal columns -->
 * <ContentPlaceholder :columns="['fr-col-12 fr-col-md-4', 'fr-col-12 fr-col-md-4', 'fr-col-12 fr-col-md-4']" />
 */
withDefaults(
  defineProps<{
    minHeight?: string
    columns?: string[]
  }>(),
  {
    minHeight: '400px',
    columns: () => ['fr-col-12 fr-col-md-8', 'fr-col-12 fr-col-md-4']
  }
)
</script>

<style scoped>
.content-placeholder {
  background: linear-gradient(
    90deg,
    var(--background-contrast-grey) 0%,
    var(--background-alt-grey) 50%,
    var(--background-contrast-grey) 100%
  );
  border-radius: 4px;
}
</style>
