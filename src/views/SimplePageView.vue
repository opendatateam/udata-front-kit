<script setup>
import { computed, ref, watchEffect, onBeforeUpdate } from "vue"
import { pageStore } from "../store/PageStore"
import MarkdownIt from "markdown-it"

const markdown = new MarkdownIt()
const store = pageStore()
const content = computed(() => store.content)
const props = defineProps(["url"])
let url = props.url

watchEffect(() => {
  store.getPageFromUrl(url)
})

onBeforeUpdate(() => {
  url = props.url
  store.getPageFromUrl(url)
})
</script>

<template>
  <div>
    <br /><br />
    <div v-html="markdown.render(content)" />
  </div>
</template>

<style>
</style>
