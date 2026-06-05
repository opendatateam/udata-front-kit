<template>
  <section class="article-section">
    <h2 :id="id" class="fr-h2 article-section__title fr-mb-4w">
      <slot name="heading">{{ label }}</slot>
    </h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { articleSectionKey } from './articleSectionKey'

const props = defineProps<{
  id: string
  label: string
}>()

const register = inject(articleSectionKey)
onMounted(() => register?.(props.id, props.label))
</script>

<style scoped>
.article-section__title {
  margin-top: 2rem;
  margin-bottom: 0;
  color: var(--text-default-grey);
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}
</style>
