<script lang="ts" setup>
import { DsfrButton } from '@gouvminint/vue-dsfr'

const searchQuery = ref<string>('')

const emit = defineEmits<{ 'on-search': [query: string] }>()
const handleSearch = () => {
  emit('on-search', searchQuery.value)
}
</script>

<template>
  <search>
    <form
      class="fr-search-bar fr-search-bar--lg"
      @submit.prevent="handleSearch"
    >
      <DsfrInput
        id="homeSearch"
        v-model="searchQuery"
        type="search"
        label="Explorer les données actuellement disponibles"
        :label-visible="true"
      />
      <DsfrButton label="Rechercher" icon="fr-icon-search-line" />
    </form>
  </search>
</template>

<style scoped>
form {
  flex-flow: row wrap;
  gap: 0.5rem 0;
}
form :deep(.fr-label) {
  font-size: 1.2rem;
  flex: 1 1 100%;
  clip: revert;
  height: revert;
  margin: revert;
  overflow: revert;
  position: revert;
  white-space: revert;
  width: revert;
}
form :deep(.fr-input) {
  margin: 0;
  flex: 1 0 80%;
  box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
}
form :deep(.fr-button) {
  flex: 1;
}
</style>
