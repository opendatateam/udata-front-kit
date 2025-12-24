<script setup lang="ts">
import type { ResolvedFactor } from '@/model/topic'
import { exportFactors } from '@/services/export'

const props = defineProps({
  filename: {
    type: String,
    required: true
  },
  factors: {
    type: Array<ResolvedFactor>,
    default: []
  },
  hasOgcResources: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  openTopicInQgis: []
}>()

const doExport = async () => {
  const data = await exportFactors(props.factors)
  const link = document.createElement('a')
  link.href = URL.createObjectURL(data)
  link.setAttribute('download', `${props.filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div v-if="factors.length > 0" class="flex align-start fr-mt-2w">
    <div class="button-group fr-ml-auto">
      <DsfrButton
        v-if="hasOgcResources"
        size="sm"
        type="button"
        label="Ouvrir tous les jeux de données dans QGIS"
        class="fr-mt-2w test__open_topic_in_qgis_btn"
        icon="fr-icon-road-map-line"
        secondary
        @click.prevent="emit('openTopicInQgis')"
      />
      <DsfrButton
        size="sm"
        type="button"
        label="Exporter la liste des jeux de données"
        class="fr-mt-2w"
        icon="fr-icon-file-download-line"
        secondary
        @click.prevent="doExport"
      />
    </div>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 1rem;
}
</style>
