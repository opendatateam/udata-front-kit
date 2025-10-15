<script setup lang="ts">
import { useResourceStore } from '@/store/ResourceStore'
import type { DatasetV2 } from '@datagouv/components-next'
import { initializeVisualization } from '@ecolabdata/tabular-dataviz'
import '@ecolabdata/tabular-dataviz/styles/visualisation.css'
import type {
  IndicatorExtras,
  IndicatorResourceExtras
} from '../../model/indicator'

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
// Track if visualization has been initialized to prevent multiple calls
const isInitialized = ref(false)

// Format files according to the format expected by the visualization module
const indicatorResources = computed(() => {
  const mainResourcesGroup = resourceStore.data[props.indicator.id]?.find(
    (group) => group.type?.id === 'main'
  )
  return (
    mainResourcesGroup?.resources
      .map((resource) => {
        const metadata = resource.extras[
          'ecospheres-indicateurs'
        ] as IndicatorResourceExtras | null
        return {
          id: resource.id,
          mesh: metadata?.maille,
          valueColumn: metadata?.['value-column'],
          axes: Object.keys(metadata?.axes || {})
        }
      })
      .filter((f) => f.mesh) || []
  )
})

// Format indicator according to the format expected by the visualization module
const indicatorForGraph = computed(() => {
  const metadata = props.indicator.extras[
    'ecospheres-indicateurs'
  ] as IndicatorExtras

  const formatted = {
    id: props.indicator.id,
    unite: metadata?.unite ?? 'na',
    summable: metadata?.summable ?? false,
    enableVisualisation: metadata?.['enable_visualization'] ?? false
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

// Watch for resources becoming available and initialize once
watch(
  indicatorResources,
  async (newResources) => {
    if (
      newResources.length > 0 &&
      indicatorForGraph.value.enableVisualisation &&
      !isInitialized.value
    ) {
      isInitialized.value = true
      await initializeWhenReady()
    }
  },
  { immediate: true }
)
</script>

<template
  v-if="indicatorResources.length > 0 && indicatorForGraph.enableVisualisation"
>
  <h2 class="subtitle subtitle--uppercase">Pré-visualisation</h2>
  <!-- Visualisation will use this div to render the graph through @ecolabadata/tabular-dataviz -->
  <div
    class="indicator-viz"
    :data-indicator-id="indicator.id"
    :data-files="encodeURIComponent(JSON.stringify(indicatorResources))"
    :data-indicator="encodeURIComponent(JSON.stringify(indicatorForGraph))"
    :data-tabular-api-url="props.tabularApiUrl"
    :data-chart-title="props.indicator.title"
  ></div>
</template>
