<script setup lang="ts">
import { computed } from 'vue'

import { fromMarkdown } from '@/utils'
import { useMeta } from '@/utils/seo'
import demarcheMarkdown from '../../../../public/static/justice/pages/demarche.md?raw'

useMeta({
  description: () =>
    'Découvrez la démarche de justice.data.gouv.fr : diffuser et valoriser les données publiques de la justice pour les rendre compréhensibles.',
  canonicalUrl: () => `${window.location.origin}/demarche`
})

const safeHtmlContent = computed(() => fromMarkdown(demarcheMarkdown).html)
</script>

<template>
  <div class="fr-container fr-py-8w">
    <div class="markdown-content" :innerHTML="safeHtmlContent" />
  </div>
</template>

<style scoped>
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-default-grey);
  padding: 0.75rem;
  text-align: left;
  vertical-align: top;
}

.markdown-content :deep(th) {
  background-color: var(--background-alt-grey);
  font-weight: 600;
  color: var(--text-title-grey);
}

.markdown-content :deep(h1) {
  text-wrap: balance;
}
</style>
