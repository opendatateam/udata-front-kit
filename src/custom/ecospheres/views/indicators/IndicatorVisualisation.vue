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
        const metadata = resource.extras['ecospheres-indicateurs']
        return {
          id: resource.id,
          mesh: metadata?.maille,
          valueColumn: metadata?.['value-column'],
          axes: metadata?.axes
        }
      })
      .filter((f) => f.mesh) || []
  )
})

// Format indicator according to the format expected by the visualization module
const indicatorForGraph = computed(() => {
  const metadata = props.indicator.extras['ecospheres-indicateurs']

  // FIXME: Mock in order to test 'pouvoir-de-rechauffement-global-par-secteur'
  const isMockDataset = props.indicator.id === '67cad6f3b0a47a080da80278'

  const formatted = {
    id: props.indicator.id,
    unite: isMockDataset ? 'tonne' : (metadata?.unite ?? ''),
    summable: isMockDataset ? true : (metadata?.summable ?? true),
    enableVisualisation: isMockDataset
      ? true
      : (metadata?.['enable_visualization'] ?? false)
  }

  return formatted
})

// Function to wait for DOM element to be ready before initializing visualization
const initializeWhenReady = async () => {
  await nextTick()

  // Wait for the indicator-viz element to be available in the DOM
  const waitForElement = () => {
    return new Promise((resolve) => {
      const checkForElement = () => {
        const element = document.querySelector(
          `[data-indicator-id="${props.indicator.id}"]`
        )
        if (element) {
          resolve(element)
        } else {
          setTimeout(checkForElement, 50)
        }
      }
      checkForElement()
    })
  }

  await waitForElement()
  initializeVisualization()
}

// Watcher to trigger visualization initialization when data changes
watch(
  indicatorFiles,
  (newIndicatorFiles, oldIndicatorFiles) => {
    if (
      JSON.stringify(newIndicatorFiles) !== JSON.stringify(oldIndicatorFiles)
    ) {
      initializeWhenReady()
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
