<template>
  <div class="fr-tile fr-enlarge-link fr-tile--sm fr-tile--vertical folder-card">
    <div class="fr-tile__body">
      <div class="fr-tile__content">
        <h3 class="fr-tile__title">
          <RouterLink :to="to">{{ title }}</RouterLink>
        </h3>
        <p class="fr-tile__desc">{{ description }}</p>
        <p class="fr-tile__detail">
          {{ articleCount }}&nbsp;{{ articleCount > 1 ? 'articles' : 'article' }}
        </p>
      </div>
    </div>
    <div class="fr-tile__header">
      <div class="fr-tile__pictogram">
        <img :src="bindersPictoSrc" aria-hidden="true" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BindersPictoRaw from '@gouvfr/dsfr/dist/artwork/pictograms/document/binders.svg?raw'

const bindersPictoSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BindersPictoRaw.replace(/#E1000F/gi, '#3f3a20'))}`

defineProps<{
  title: string
  description: string
  to: string
  articleCount: number
}>()
</script>

<style scoped>
.folder-card {
  height: 100%;
}
</style>
