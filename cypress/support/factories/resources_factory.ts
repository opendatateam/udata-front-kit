import type { Resource } from '@/model/resource'
import { build, sequence } from 'mimicry-js'

/**
 * Factory for creating Resource mocks
 */
export const resourceFactory = build<Resource>({
  fields: {
    id: sequence((x) => `resource-${x}`),
    title: sequence((x) => `Resource ${x}`),
    description: 'Sample resource description',
    url: sequence((x) => `https://example.com/resource-${x}`),
    format: 'csv',
    type: 'main',
    filesize: 1024,
    mime: 'text/csv',
    created_at: '2024-01-01T00:00:00',
    last_modified: '2024-01-01T00:00:00',
    extras: {},
    harvest: null,
    preview_url: null,
    schema: null
  },
  traits: {
    wfs: {
      overrides: {
        title: sequence((x) => `WFS Service ${x}`),
        url: sequence(
          (x) =>
            `https://example.com/wfs?service=WFS&request=GetCapabilities&typename=layer_${x}`
        ),
        format: 'wfs',
        mime: 'application/xml'
      }
    },
    wms: {
      overrides: {
        title: sequence((x) => `WMS Service ${x}`),
        url: sequence(
          (x) =>
            `https://example.com/wms?service=WMS&request=GetCapabilities&layers=layer_${x}`
        ),
        format: 'wms',
        mime: 'application/xml'
      }
    },
    csv: {
      overrides: {
        format: 'csv',
        mime: 'text/csv'
      }
    }
  }
})
