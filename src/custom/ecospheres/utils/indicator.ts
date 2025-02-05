import config from '@/config'
import { useSpatialStore } from '@/store/SpatialStore'
import type { IndicatorsConf } from '../model/config'
import type {
  Indicator,
  IndicatorExtras,
  IndicatorExtrasCalcul,
  IndicatorExtrasSource,
  IndicatorFilters,
  IndicatorsExtrasApi
} from '../model/indicator'

const indicatorsConf = config.indicators as IndicatorsConf
const tagPrefix = indicatorsConf.global_tag_prefix
const filters = indicatorsConf.filters

export const UNFILLED_LABEL = 'Non renseigné'

interface QueryArgs extends IndicatorFilters {
  [key: string]: string | null
}

/**
 * Build an array of normalized tags from query components and clean the original QueryArgs
 */
export const useTagsQuery = (
  query: QueryArgs
): { tag: Array<string>; extraArgs: QueryArgs } => {
  const queryArray = []
  for (const filter of filters) {
    if (query[filter.id] != null) {
      queryArray.push(`${tagPrefix}-${filter.id}-${query[filter.id]}`)
    }
    delete query[filter.id]
  }
  return {
    tag: queryArray,
    extraArgs: query
  }
}

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
      const extras: IndicatorExtras =
        indicator.value?.extras?.['ecospheres-indicateurs']
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
