import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

const topicFactory = build({
  fields: {
    organization: dinumOrganization,
    name: 'Sample Topic',
    description: 'Sample description',
    created_at: '2025-07-28T12:03:28.390000+00:00',
    last_modified: '2025-07-28T14:03:44.363000+00:00',
    id: sequence((x) => `topic_id_${x}`),
    private: false,
    slug: sequence((x) => `topic_slug_${x}`),
    tags: [],
    uri: sequence((x) => `/api/1/topics/topic_slug_${x}/`)
  }
})

export default {
  topicFactory
}
