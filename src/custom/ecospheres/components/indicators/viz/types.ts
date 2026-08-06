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
  // Passed straight through to the Chart.js dataset: hides the line without
  // removing it from the array, so dataset indices (and thus colors) stay
  // stable regardless of which values are currently checked.
  hidden?: boolean
  // Set when displaying a single axis's values (see useIndicatorVizChart's
  // applyColors): renders as a stacked area rather than plain lines.
  fill?: boolean
}

export interface AxisValueDisplay {
  value: string
  color: string
}
