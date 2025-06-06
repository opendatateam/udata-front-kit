<script setup lang="ts">
import type { DatasetElement } from '@/model/topic'
import { exportElements } from '@/services/export'

const props = defineProps({
  filename: {
    type: String,
    required: true
  },
  elements: {
    type: Array<DatasetElement>,
    default: []
  }
})

const doExport = async () => {
  const data = await exportElements(props.elements)
  const link = document.createElement('a')
  link.href = URL.createObjectURL(data)
  link.setAttribute('download', `${props.filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div v-if="elements.length > 0" class="flex align-start fr-mt-2w">
    <DsfrButton
      size="sm"
      type="button"
      label="Exporter la liste des jeux de données"
      class="fr-mt-2w fr-ml-auto"
      icon="fr-icon-file-download-line"
      secondary
      @click.prevent="doExport"
    />
  </div>
</template>
