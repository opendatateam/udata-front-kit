import type { SiteId, Topic } from '@/model/topic'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

export const topicFactory = build<Topic>({
  fields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union
    organization: dinumOrganization as any,
    owner: null,
    name: 'Sample Topic',
    description: 'A sample topic description',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    extras: {
      ['ecospheres' as SiteId]: {}
    },
    featured: false,
    id: sequence((n) => `id-topic-${n}`),
    private: false,
    slug: sequence((n) => `sample-topic-${n}`),
    tags: ['ecospheres'],
    uri: sequence(
      (n) => `https://www.data.gouv.fr/api/2/topics/slug-topic-${n}`
    ),
    spatial: undefined,
    page: sequence((n) => `https://www.data.gouv.fr/topics/slug-topic-${n}`),
    elements: {
      rel: 'subsection',
      href: sequence(
        (n) =>
          `https://www.data.gouv.fr/api/2/topics/id-topic-${n}/elements/?page=1&page_size=20`
      ),
      type: 'GET',
      total: 0
    }
  }
})
