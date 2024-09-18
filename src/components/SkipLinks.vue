<script lang="ts" setup>
import { ref } from 'vue'

interface SkipLinksProps {
  links: {
    id: string
    text: string
    ref?: string
  }[]
}

export type { SkipLinksProps }

defineProps<SkipLinksProps>()

// need an array because ref is an a loop
const firstSkipLink = ref<HTMLAnchorElement[] | null>(null)

defineExpose({
  firstSkipLink
})
</script>

<template>
  <nav class="fr-container" role="navigation" aria-label="Accès rapide">
    <ul class="skiplinks__list" role="list">
      <li v-for="(link, index) of links" :key="link.id">
        <a
          v-if="index === 0"
          ref="firstSkipLink"
          class="fr-link"
          :href="`#${link.id}`"
          >{{ link.text }}</a
        >
        <a v-else class="fr-link" :href="`#${link.id}`">{{ link.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.skiplinks__list {
  padding: 6px;
  position: fixed;
  top: 0;
  left: 20px;
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
  block-size: 1px;
  inline-size: 1px;
  -webkit-clip: rect(0 0 0 0);
  clip: rect(0 0 0 0);
  overflow: hidden;
  z-index: 99999;
  background-color: #fff;
}
.skiplinks__list:focus-within {
  -webkit-clip: auto;
  clip: auto;
  overflow: visible;
  inline-size: auto;
  block-size: auto;
}
</style>
