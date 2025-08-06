<script setup lang="ts">
import { useResourceStore } from '@/store/ResourceStore'
import type { DatasetV2 } from '@datagouv/components'
import { initializeVisualization } from '@ecolabdata/tabular-dataviz'
import '@ecolabdata/tabular-dataviz/styles/visualisation.css'

const props = defineProps({
  indicator: {
    type: Object as () => DatasetV2,
    required: true
  },
  tabularApiUrl: {
    type: String,
    required: true
  }
})

const resourceStore = useResourceStore()

// Format files according to the format expected by the visualization module
const indicatorFiles = computed(() => {
  const allIndicatorRessources = resourceStore.data[props.indicator.id]
  const mainResourcesGroup = allIndicatorRessources?.find(
    (group) => group.type?.id === 'main'
  )
  return (
    mainResourcesGroup?.resources
      .map((resource) => {
        const metaData = resource.extras['ecospheres-indicateurs']
        return {
          id: resource.id,
          mesh: metaData?.maille,
          valueColumn: metaData?.['value-column'],
          axes: metaData?.axes
        }
      })
      .filter((f) => f.mesh) || []
  )
})

// Format indicator according to the format expected by the visualization module
const indicatorForGraph = computed(() => {
  const metaData = props.indicator.extras['ecospheres-indicateurs']

  // FIXME: Mock in order to test 'pouvoir-de-rechauffement-global-par-secteur'
  const isMockDataset = props.indicator.id === '67cad6f3b0a47a080da80278'

  const formatted = {
    id: props.indicator.id,
    unite: isMockDataset ? 'tonne' : (metaData?.unite ?? ''),
    summable: isMockDataset ? true : (metaData?.summable ?? true),
    enableVisualisation: isMockDataset
      ? true
      : (metaData?.['enable_visualization'] ?? false)
  }

  return formatted
})

// Watcher to trigger visualization initialization when data changes
watch(
  indicatorFiles,
  (newIndicatorFiles, oldIndicatorFiles) => {
    if (
      JSON.stringify(newIndicatorFiles) !== JSON.stringify(oldIndicatorFiles)
    ) {
      nextTick(() => {
        // FIXME: to many timeout tricks here
        setTimeout(() => {
          initializeVisualization({ timeout: 500 })
        }, 100)
      })
    }
  },
  { immediate: true }
)
</script>

<template
  v-if="indicatorFiles.length > 0 && indicatorForGraph.enableVisualisation"
>
  <h2 class="subtitle subtitle--uppercase">Pré-visualisation</h2>
  <!-- Visualisation will use this div to render the graph through @ecolabadata/tabular-dataviz -->
  <div
    class="indicator-viz"
    :data-indicator-id="indicator.id"
    :data-files="encodeURIComponent(JSON.stringify(indicatorFiles))"
    :data-indicator="encodeURIComponent(JSON.stringify(indicatorForGraph))"
    :data-tabular-api-url="props.tabularApiUrl"
  ></div>
</template>
