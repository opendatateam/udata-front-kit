import type { IndicatorMesh } from '../../../model/indicator'

export function useIndicatorVizParams(initialMesh: IndicatorMesh = 'fr') {
  const mesh = ref<IndicatorMesh>(initialMesh)
  const territory = ref('')

  function setMesh(newMesh: IndicatorMesh) {
    territory.value = ''
    mesh.value = newMesh
  }

  // Writable computed so v-model on IndicatorVizMeshSelect routes through setMesh,
  // guaranteeing that territory is always reset in the same synchronous call as
  // the mesh change. Vue batches both ref mutations before any watcher fires, so
  // useTabularData always sees a consistent (mesh, territory) pair.
  const meshModel = computed({
    get: () => mesh.value,
    set: setMesh
  })

  return { mesh, territory, meshModel, setMesh }
}
