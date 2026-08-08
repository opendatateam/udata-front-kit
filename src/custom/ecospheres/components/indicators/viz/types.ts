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
  // Hides the Chart.js dataset without removing it, so indices/colors stay
  // stable regardless of which values are checked.
  hidden?: boolean
  // Renders as a stacked area instead of a plain line.
  fill?: boolean
}

export interface AxisValueDisplay {
  value: string
  color: string
}
