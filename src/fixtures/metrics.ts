import type {
  Dataservice,
  DatasetV2,
  Organization,
  Reuse
} from '@datagouv/components-next'

// high values, to check the display of large numbers
export const highDatasetMetrics: DatasetV2['metrics'] = {
  discussions: 0,
  discussions_open: 0,
  dataservices: 3,
  followers: 120,
  resources_downloads: 42500,
  reuses: 18,
  views: 1250000
}

export const highDataserviceMetrics: Dataservice['metrics'] = {
  discussions: 0,
  discussions_open: 0,
  followers: 42,
  reuses: 8,
  views: 24300
}

export const highReuseMetrics: Reuse['metrics'] = {
  datasets: 4,
  discussions: 0,
  discussions_open: 0,
  followers: 340,
  views: 98700
}

export const highOrganizationMetrics: Organization['metrics'] = {
  datasets: 1240,
  datasets_by_months: {},
  dataservices: 12,
  dataservices_by_months: {},
  reuses: 37,
  reuses_by_months: {},
  followers: 2400,
  members: 25,
  views: 3500000
}
