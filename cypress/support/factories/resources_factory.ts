import type { Resource } from '@datagouv/components-next'
import { build, sequence } from 'mimicry-js'

export const resourceFactory = build<Resource>({
  fields: {
    id: sequence((x) => `resource_${x}`),
    title: 'Test Resource',
    type: 'main',
    format: 'csv',
    url: 'https://example.com/data.csv',
    filesize: 1024,
    mime: 'text/csv',
    created_at: '2025-01-01T00:00:00',
    last_modified: '2025-01-01T00:00:00',
    checksum: null,
    description: 'Test resource description',
    harvest: null,
    filetype: 'file',
    schema: null,
    preview_url: '',
    internal: {},
    latest: '2025-01-01T00:00:00',
    metrics: {
      views: 0
    },
    extras: {}
  }
})
