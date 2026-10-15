<script lang="ts" setup>
import type { DatasetV2 } from '@datagouv/components-next'
import { toRef } from 'vue'

import { provideJusticeDataset } from '@/custom/justice/utils/dataset'

import './justice.css'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    loading?: boolean
    error?: boolean
    loadingLabel?: string
    errorLabel?: string
    dataset?: DatasetV2 | null
  }>(),
  {
    loading: false,
    error: false,
    loadingLabel: 'Préparation des graphiques…',
    errorLabel: 'Les données n’ont pas pu être chargées.',
    dataset: null
  }
)

provideJusticeDataset(toRef(props, 'dataset'))
</script>

<template>
  <section>
    <h2>{{ title }}</h2>
    <p class="section-lead fr-text--lead">{{ description }}</p>
    <p v-if="loading">{{ loadingLabel }}</p>
    <p v-else-if="error">{{ errorLabel }}</p>
    <slot v-else />
  </section>
</template>

<style scoped>
h2 {
  text-wrap: balance;
}

.section-lead {
  max-inline-size: 52rem;
}
</style>
