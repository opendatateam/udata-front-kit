import type { IndicatorMesh } from '../../../model/indicator'

export const DEFAULT_TABULAR_API_URL = 'https://tabular-api.data.gouv.fr'

// 'fr' has no entry: national-level data needs no territory filter.
// 'commune' has no entry: the tabular API doesn't expose a commune-level
// geocode column to filter on.
export const GEOCOLUMNS: Record<
  Exclude<IndicatorMesh, 'fr' | 'commune'>,
  string
> = {
  departement: 'geocode_departement',
  region: 'geocode_region',
  epci: 'geocode_epci'
}

// 'commune' is excluded (see GEOCOLUMNS above); IndicatorVizMeshSelect lists
// it separately, gated on commune-level data actually being available.
export const MESHES: [IndicatorMesh, string][] = [
  ['fr', 'National'],
  ['region', 'Région'],
  ['departement', 'Département'],
  ['epci', 'EPCI']
]

export const YEAR_COLUMN = 'date_mesure'

// https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/couleurs--palette
export const COLORS = [
  '#6A6AF4',
  '#000091',
  '#E1000F',
  '#B7A73F',
  '#66673D',
  '#68A532',
  '#447049',
  '#00A95F',
  '#297254',
  '#009081',
  '#37635F',
  '#009099',
  '#006A6F',
  '#465F9D',
  '#2F4077',
  '#417DC4',
  '#3558A2',
  '#A558A0',
  '#6E445A',
  '#E18B76',
  '#8D533E',
  '#CE614A',
  '#A94645',
  '#C8AA39',
  '#716043',
  '#C3992A',
  '#695240',
  '#E4794A',
  '#755348',
  '#D1B781',
  '#685C48',
  '#C08C65',
  '#845d48',
  '#BD987A',
  '#745B47',
  '#AEA397',
  '#6A6156',
  '#C9191E'
]

export function getSeriesColor(index: number): string {
  return COLORS[index % COLORS.length]
}
