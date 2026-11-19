import type { SpatialField } from '@/model/spatial'
import type { SiteId, Topic } from '@/model/topic'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

export const topicBaseFields = {
  name: 'Sample Topic',
  description: 'A sample topic description',
  created_at: new Date().toISOString(),
  last_modified: new Date().toISOString(),
  featured: false,
  private: false,
  spatial: undefined as SpatialField | undefined
}

export const makeTopicSequenceFields = () => ({
  id: sequence((n) => `id-topic-${n}`),
  slug: sequence((n) => `sample-topic-${n}`),
  uri: sequence((n) => `https://www.data.gouv.fr/api/2/topics/slug-topic-${n}`),
  page: sequence((n) => `https://www.data.gouv.fr/topics/slug-topic-${n}`),
  elements: {
    rel: 'subsection' as const,
    href: sequence(
      (n) =>
        `https://www.data.gouv.fr/api/2/topics/id-topic-${n}/elements/?page=1&page_size=20`
    ),
    type: 'GET' as const,
    total: 0
  }
})

export const topicFactory = build<Topic>({
  fields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union
    organization: dinumOrganization as any,
    owner: null,
    ...topicBaseFields,
    ...makeTopicSequenceFields(),
    extras: { ['ecospheres' as SiteId]: {} },
    tags: ['ecospheres']
  }
})
