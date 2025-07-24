<script setup lang="ts">
import { useResourceStore } from '@/store/ResourceStore'
import type { DatasetV2 } from '@datagouv/components'
import { useHead } from '@unhead/vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  indicator: {
    type: Object as () => DatasetV2,
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
  return {
    id: props.indicator.id,
    unite: metaData?.unite ?? '',
    summable: metaData?.summable,
    enableVisualisation: metaData?.['enable_visualization']
  }
})

// On ajoute dans le header de la page HTML le code js du module de visualisation
// Ainsi que le code de la dépendance choices.js pour faire un select avec de la recherche
// et les fichiers de style
useHead({
  script: [
    { src: '/visualisation/index.mjs', defer: true, type: 'module' },
    { src: '/choices/choices.min.js', defer: true }
  ],
  link: [
    { rel: 'stylesheet', href: '/choices/choices.min.css' },
    { rel: 'stylesheet', href: '/visualisation/visualisation.css' }
  ]
})

// Watcher pour attendre que le script du module de visualisation a bien été chargé
// ainsi que les metadonnées des fichiers
// le script de visualisation expose la fonction `makeIndicatorVisualisation` dans `window`
// on attend que celle-ci soit bien accessible avant de l'invoquer
watch(
  // @ts-expect-error makeIndicatorVisualisation is defined in the visualisation/index.mjs header script
  [indicatorFiles, () => window.makeIndicatorVisualisation],
  ([newIndicatorFiles, newCallback], [oldIndicatorFiles, oldCallback]) => {
    console.log(newCallback)
    if (
      JSON.stringify(newIndicatorFiles) !== JSON.stringify(oldIndicatorFiles) ||
      newCallback !== oldCallback
    ) {
      if (newCallback) newCallback()
    }
  }
)

// On expose Chart.js dans `window` pour que le script de visualisation puisse l'utiliser sans qu'il le charge lui-même
// @ts-expect-error make Chart.js available for the visualisation/index.mjs header script without import
window.Chart = Chart

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
  ></div>
</template>
