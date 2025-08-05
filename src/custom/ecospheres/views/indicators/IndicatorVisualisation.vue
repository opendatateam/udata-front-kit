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

// On formate les fichiers selon le format attendu par le module de visualisation
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

// On formate l'indicateur selon le format attendu par le module de visualisation
const indicatorForGraph = computed(() => {
  const metaData = props.indicator.extras['ecospheres-indicateurs']

  // FIXME:
  // Mock pour tester le dataset 'pouvoir-de-rechauffement-global-par-secteur'
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

// Watcher pour initialiser la visualisation quand les données changent
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

// Pour le html :
// On affiche le module de visualisation seulement si l'indicateur a des fichiers dans data.gouv.fr
// Et si il a bien `enable_visualization` dans les meta données de l'indicateur
// On met une <div> avec la classe `indicator-viz` que le script de visualisation va reconnaitre et remplir
// on passe les données des fichiers et de l'indicateur via les attributs data-* de la div
</script>

<template
  v-if="indicatorFiles.length > 0 && indicatorForGraph.enableVisualisation"
>
  <h2 class="subtitle subtitle--uppercase">Pré-visualisation</h2>
  <div
    class="indicator-viz"
    :data-indicator-id="indicator.id"
    :data-files="encodeURIComponent(JSON.stringify(indicatorFiles))"
    :data-indicator="encodeURIComponent(JSON.stringify(indicatorForGraph))"
    :data-tabular-api-url="props.tabularApiUrl"
  ></div>
</template>
