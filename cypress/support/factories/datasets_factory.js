import { build } from 'mimicry-js'

const datasetFactory = build({
  fields: {
    title: 'Dataset Title',
    description: 'Dataset Description',
    organization: 'organization-slug',
    class: 'Dataset',
    id: '57fe2a35c751df21e179df72',
    slug: 'dataset-slug',
    uri: 'https://demo.data.gouv.fr/api/1/datasets/dataset-slug/'
  }
})

export default {
  datasetFactory
}
