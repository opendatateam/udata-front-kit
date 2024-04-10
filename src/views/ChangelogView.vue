<script setup lang="ts">
import { computed } from 'vue'

import { fromMarkdown } from '@/utils'

import changelogContent from '../../CHANGELOG.md?raw'

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: 'Changelog' }
])
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="fromMarkdown(changelogContent)"></div>
  </div>
</template>
