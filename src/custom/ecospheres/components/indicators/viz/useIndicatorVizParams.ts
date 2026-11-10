import { useRouteQueryAsString } from '@/router/utils'
import type { IndicatorMesh } from '../../../model/indicator'
import { MESHES, needsTerritory } from './enums'

const isMesh = (value: string | null | undefined): value is IndicatorMesh =>
  value === 'commune' || MESHES.some(([mesh]) => mesh === value)

// state from ?mesh/?territory; URL written only after a user change (chart stays mounted on other tabs)
export function useIndicatorVizParams(defaultMesh: IndicatorMesh = 'fr') {
  const route = useRoute()
  const router = useRouter()

  const { query } = useRouteQueryAsString()
  const initialMesh = isMesh(query.mesh) ? query.mesh : defaultMesh
  const mesh = ref<IndicatorMesh>(initialMesh)
  const territory = ref(
    needsTerritory(initialMesh) ? (query.territory ?? '') : ''
  )

  const touched = ref(false)

  // Marks a user selection, as opposed to an automatic fallback
  function touch() {
    touched.value = true
  }

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
    set: (newMesh: IndicatorMesh) => {
      touch()
      setMesh(newMesh)
    }
  })

  watch([mesh, territory], async ([newMesh, newTerritory]) => {
    if (!touched.value) return
    // skip the transient state while territory options load
    if (needsTerritory(newMesh) && !newTerritory) return
    await router.replace({
      query: {
        ...route.query,
        mesh: newMesh,
        territory: needsTerritory(newMesh) ? newTerritory : undefined
      }
    })
  })

  return { mesh, territory, meshModel, setMesh, touch }
}
