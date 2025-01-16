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
  geom?: string | null
  zones?: string[] | string | null
  granularity?: string | null
}

export interface SpatialCoverageResponse {
  id: string
  properties: Omit<SpatialCoverage, 'id'>
  type: string
}
