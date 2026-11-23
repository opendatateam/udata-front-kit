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
  hidden?: boolean
  // "fill" is chart.js version of our "stacked" attribute
  fill?: boolean
}

export interface AxisValueDisplay {
  value: string
  color: string
}
