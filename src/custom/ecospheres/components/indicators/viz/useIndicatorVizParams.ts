import type { LocationQueryValue } from 'vue-router'
import type { IndicatorMesh } from '../../../model/indicator'
import { GEOCOLUMNS } from './enums'

const hasTerritory = (mesh: string) =>
  Object.prototype.hasOwnProperty.call(GEOCOLUMNS, mesh)

const isMesh = (value: string | undefined): value is IndicatorMesh =>
  value === 'fr' || value === 'commune' || (!!value && hasTerritory(value))

const queryString = (value: LocationQueryValue | LocationQueryValue[]) =>
  typeof value === 'string' ? value : undefined

// state from ?mesh/?territory; URL written only after a user change (chart stays mounted on other tabs)
export function useIndicatorVizParams(defaultMesh: IndicatorMesh = 'fr') {
  const route = useRoute()
  const router = useRouter()

  const queryMesh = queryString(route.query.mesh)
  const initialMesh = isMesh(queryMesh) ? queryMesh : defaultMesh
  const mesh = ref<IndicatorMesh>(initialMesh)
  const territory = ref(
    hasTerritory(initialMesh) ? (queryString(route.query.territory) ?? '') : ''
  )

  const touched = ref(false)

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
      touched.value = true
      setMesh(newMesh)
    }
  })

  // Marks a user territory selection, as opposed to an automatic fallback
  function touch() {
    touched.value = true
  }

  watch([mesh, territory], async ([newMesh, newTerritory]) => {
    if (!touched.value) return
    // skip the transient state while territory options load
    if (hasTerritory(newMesh) && !newTerritory) return
    await router.replace({
      query: {
        ...route.query,
        mesh: newMesh,
        territory: hasTerritory(newMesh) ? newTerritory : undefined
      }
    })
  })

  return { mesh, territory, meshModel, setMesh, touch }
}
