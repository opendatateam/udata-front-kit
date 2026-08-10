export interface IndicatorVizFormattedRow {
  year: number
  value: number
  [axis: string]: string | number
}

export interface IndicatorVizChartSeries {
  label: string
  data: { x: number; y: number }[]
  borderColor?: string
  backgroundColor?: string
}
