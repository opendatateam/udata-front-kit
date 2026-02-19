import type { Reuse } from '@datagouv/components-next'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

export const reuseFactory = build<Reuse>({
  fields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union
    organization: dinumOrganization as any,
    owner: null,
    title: sequence((x) => `Sample Reuse ${x}`),
    description: 'Sample reuse description',
    tags: ['reuse', 'sample'],
    datasets: [],
    dataservices: [],
    topic: 'economy_and_business',
    type: 'application',
    url: sequence((x) => `https://example.com/reuse_${x}`),
    private: false,
    badges: [],
    created_at: '2026-02-10T20:27:51.065000+00:00',
    archived: null,
    deleted: null,
    extras: {},
    featured: false,
    id: sequence((x) => `reuse_id_${x}`),
    image: null,
    image_thumbnail: null,
    last_modified: '2026-02-10T20:28:06.645000+00:00',
    metrics: {
      datasets: 0,
      discussions: 0,
      discussions_open: 0,
      followers: 0,
      views: 0
    },
    slug: sequence((x) => `reuse-slug-${x}`),
    page: sequence((x) => `https://www.data.gouv.fr/reuses/reuse-slug-${x}`),
    uri: sequence(
      (x) => `https://www.data.gouv.fr/api/1/reuses/reuse-slug-${x}/`
    ),
    permissions: {
      edit: false,
      delete: false
    }
  }
})
