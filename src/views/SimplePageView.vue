<script setup>
import MarkdownIt from 'markdown-it'
import { computed, watchEffect } from 'vue'

import { pageStore } from '../store/PageStore'

const markdown = new MarkdownIt()
const store = pageStore()
const content = computed(() => store.content)
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

watchEffect(async () => {
  if (!props.url) return
  store.getPageFromUrl(props.url)
})
</script>

<template>
  <div class="fr-container width-inherit">
    <br /><br />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="markdown.render(content)" />
  </div>
</template>

<style></style>
