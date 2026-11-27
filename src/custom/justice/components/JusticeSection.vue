<script lang="ts" setup>
withDefaults(
  defineProps<{
    title: string
    description: string
    loading?: boolean
    error?: boolean
    loadingLabel?: string
    errorLabel?: string
  }>(),
  {
    loading: false,
    error: false,
    loadingLabel: 'Préparation des graphiques…',
    errorLabel: 'Les données n’ont pas pu être chargées.'
  }
)
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
