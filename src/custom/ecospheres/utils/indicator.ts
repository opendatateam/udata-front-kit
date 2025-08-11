import { useSpatialStore } from '@/store/SpatialStore'
import { usePageConf } from '@/utils/config'
import type { DatasetV2 } from '@datagouv/components-next'
import type { ComputedRef } from 'vue'
import type {
  Indicator,
  IndicatorExtras,
  IndicatorExtrasCalcul,
  IndicatorExtrasSource,
  IndicatorsExtrasApi
} from '../model/indicator'

const pageConf = usePageConf('indicators')

export const UNFILLED_LABEL = 'Non renseigné'

export const useIndicatorExtras = (indicator: Ref<Indicator | undefined>) => {
  const unite: Ref<string | undefined> = ref()
  const mailles: Ref<string[]> = ref([])
  const axes: Ref<Record<string, string[]>> = ref({})
  const calcul: Ref<IndicatorExtrasCalcul | undefined> = ref()
  const sources: Ref<IndicatorExtrasSource[]> = ref([])
  const api: Ref<IndicatorsExtrasApi | undefined> = ref()

  const store = useSpatialStore()
  store.loadLevels()

  watch(
    indicator,
    () => {
      const extras = indicator.value?.extras?.['ecospheres-indicateurs'] as
        | IndicatorExtras
        | undefined
      if (extras) {
        unite.value = extras.unite
        mailles.value = (extras.mailles_geographiques || [])
          .map((m: string) => store.getLevelById(m)?.name)
          .filter((v) => v !== undefined)
        axes.value = extras.axes
        calcul.value = extras.calcul
        api.value = extras.api
        sources.value = extras.sources
      }
    },
    { immediate: true }
  )

  return {
    unite,
    mailles,
    axes,
    calcul,
    api,
    sources
  }
}

export const isIndicator = (
  dataset: Ref<DatasetV2 | undefined>
): ComputedRef<boolean> => {
  return computed(() => {
    if (!pageConf.tag_prefix) return false
    return dataset.value?.tags?.includes(pageConf.tag_prefix) || false
  })
}
