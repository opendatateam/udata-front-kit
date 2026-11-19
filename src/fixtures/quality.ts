import type { Dataservice, Quality } from '@datagouv/components-next'

export const completeDatasetQuality: Quality = {
  score: 1,
  dataset_description_quality: true,
  resources_documentation: true,
  license: true,
  update_frequency: true,
  update_fulfilled_in_time: true,
  has_open_format: true,
  temporal_coverage: true,
  spatial: true,
  all_resources_available: true
}

export const partialDatasetQuality: Quality = {
  ...completeDatasetQuality,
  score: 0.33,
  resources_documentation: false,
  spatial: false,
  temporal_coverage: false,
  update_fulfilled_in_time: false
}

export const completeDataserviceQuality: Dataservice['quality'] = {
  score: 1,
  has_description: true,
  has_machine_documentation: true,
  has_technical_documentation: true,
  has_business_documentation: true,
  license: true,
  has_contact_point: true,
  has_base_api_url: true,
  availability_documented: true,
  rate_limiting_documented: true,
  access_conditions_clear: true
}
