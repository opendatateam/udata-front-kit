<template>
  <div class="fr-mb-8w">
    <h1>{{ topic.name }}</h1>

    <p class="fr-text--lead">
      {{ grist_data.Description_longue }}
    </p>

    <h2 class="fr-h2 fr-my-5w">Contexte et cadre juridique</h2>

    <h3 class="fr-h6">
      <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
      Contexte
    </h3>

    <p v-html="fromMarkdown(grist_data.Contexte)"></p>

    <h3 class="fr-h6">
      <span aria-hidden="true" class="fr-icon-newspaper-fill"></span>
      Cadre juridique
    </h3>

    <p v-html="fromMarkdown(grist_data.Cadre_juridique)"></p>

    <h2 class="fr-h2 fr-my-5w">Solutions disponibles</h2>

    <h3 class="fr-h3 fr-my-3w">1. Sans développement, ni budget</h3>

    <p>TODO</p>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { fromMarkdown } from '@/utils'

const props = defineProps<{
  topic: Topic
}>()

const grist_data = (props.topic.extras as any)['cas-d-usages'] as Record<
  string,
  any
>
</script>

<style scoped>
h2 {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}
h3 {
  color: #616161;
}
</style>
