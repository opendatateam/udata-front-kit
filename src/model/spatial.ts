export interface SpatialCoverage {
  code: string
  id: string
  level: string
  name: string
  uri: string
}

export interface SpatialCoverageLevel {
  id: string
  name: string
}

export interface SpatialField {
  geom?: string
  zones?: string[] | string
  granulariy?: string
}
