import { useSpatialStore } from '@/store/SpatialStore'
import { usePageConf } from '@/utils/config'
import type { DatasetV2 } from '@datagouv/components-next'
import type { ComputedRef } from 'vue'
import type {
  Indicator,
  IndicatorExtrasCalcul,
  IndicatorExtrasSource
} from '../model/indicator'

const pageConf = usePageConf('indicators')

export const UNFILLED_LABEL = 'Non renseigné'

export const useIndicatorExtras = (indicator: Ref<Indicator | undefined>) => {
  const unite: Ref<string | undefined> = ref()
  const mailles: Ref<string[]> = ref([])
  const axes: Ref<Record<string, string[]>> = ref({})
  const calcul: Ref<IndicatorExtrasCalcul | undefined> = ref()
  const sources: Ref<IndicatorExtrasSource[]> = ref([])

  const store = useSpatialStore()
  const levelsReady = store.loadLevels()

  watch(
    indicator,
    async () => {
      const extras = indicator.value?.extras?.['ecospheres-indicateurs']
      if (extras) {
        unite.value = extras.unite
        axes.value = extras.axes
        calcul.value = extras.calcul
        sources.value = extras.sources
        await levelsReady
        mailles.value = (extras.mailles_geographiques || [])
          .map((m: string) => store.getLevelById(m)?.name)
          .filter((v) => v !== undefined)
      }
    },
    { immediate: true }
  )

  return {
    unite,
    mailles,
    axes,
    calcul,
    sources
  }
}

export const isIndicator = (
  dataset: Ref<DatasetV2 | undefined>
): ComputedRef<boolean> => {
  return computed(() => {
    if (!pageConf.filter_prefix) return false
    return dataset.value?.tags?.includes(pageConf.filter_prefix) || false
  })
}
