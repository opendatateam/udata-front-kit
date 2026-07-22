<template>
  <div class="fr-my-4w">
    <DsfrCard
      horizontal
      size="sm"
      title-tag="h3"
      :title="title"
      :description="description"
      :link="to"
      :detail="label"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    to: string
    title: string
    description?: string
    label?: string
  }>(),
  { description: undefined, label: "Lire l'article" }
)
</script>
