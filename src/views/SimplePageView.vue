<script setup>
import MarkdownIt from 'markdown-it'
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import { pageStore } from '../store/PageStore'

const markdown = new MarkdownIt()
const store = pageStore()
const content = computed(() => store.content)
const title = useRouter().currentRoute.value.meta.title
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const links = computed(() => [{ to: '/', text: 'Accueil' }, { text: title }])

watchEffect(async () => {
  if (!props.url) return
  store.getPageFromUrl(props.url)
  console.log(title)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
  </div>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="markdown.render(content)" />
  </div>
</template>

<style></style>
