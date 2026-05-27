<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import config from '@/config'
import type { StaticPageConfig } from '@/model/config'
import { pageStore } from '@/store/StaticPageStore'
import { fromMarkdown } from '@/utils'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const store = pageStore()
const route = useRoute()
const content = computed(() => store.content)
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const pageConfig = computed(() =>
  config.website.router.static_pages?.find(
    (p: StaticPageConfig) => p.id === route.name
  )
)

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: pageConfig.value?.title || '' }
])

useMeta({
  title: () => pageConfig.value?.meta?.title ?? pageConfig.value?.title,
  description: () => pageConfig.value?.meta?.description,
  canonicalUrl: useCanonicalUrl()
})

watchEffect(async () => {
  if (!props.url) return
  store.getPageFromUrl(props.url)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="editorial" v-html="fromMarkdown(content)" />
  </GenericContainer>
</template>
