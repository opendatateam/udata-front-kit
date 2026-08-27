<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import config from '@/config'
import type { StaticPageConfig } from '@/model/config'
import { pageStore } from '@/store/StaticPageStore'
import { fromMarkdown } from '@/utils'
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import { DsfrSummary } from '@gouvminint/vue-dsfr'

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

const showSummary = computed(() => pageConfig.value?.summary?.display)
const isInlineSummary = computed(() => pageConfig.value?.summary?.inline)
const titleSummary = computed(() => pageConfig.value?.summary?.title)
const markdown = computed(() => fromMarkdown(content.value))

const headingList = computed(() => {
  if (!showSummary.value) return
  // Only keep h2s because DsfrSummary does not support nesting
  const h2s = markdown.value.headings?.filter((hx) => hx.level === 2)

  return h2s?.map((hx) => {
    return { link: `#${hx.id}`, name: hx.raw }
  })
})

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
  <div
    v-if="showSummary && headingList"
    class="fr-p-2w fr-py-6w fr-mt-2w fr-mb-6w fr-background-alt--yellow-moutarde"
  >
    <div class="fr-container">
      <DsfrSummary
        :title="titleSummary"
        :class="{ 'summary--inline': isInlineSummary }"
        :anchors="headingList"
      />
    </div>
  </div>
  <GenericContainer>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="editorial" v-html="markdown.html" />
  </GenericContainer>
</template>
