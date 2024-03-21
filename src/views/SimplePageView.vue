<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import { pageStore } from '../store/PageStore'
import { fromMarkdown } from '../utils'

const store = pageStore()
const router = useRouter()
const content = computed(() => store.content)
const title = computed(() => router.currentRoute.value.meta.title)
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: title.value }
])

watchEffect(async () => {
  if (!props.url) return
  store.getPageFromUrl(props.url)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="fromMarkdown(content)" />
  </div>
</template>

<style></style>
