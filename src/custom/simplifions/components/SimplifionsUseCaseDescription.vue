<template>
  <h1>{{ topic.name }}</h1>

  <p class="fr-text--lead">{{ gris_data.Description_longue }}</p>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'

const props = defineProps<{
  topic: Topic
}>()

const gris_data = (props.topic.extras as any)['cas-d-usages'] as Record<
  string,
  any
>
</script>
