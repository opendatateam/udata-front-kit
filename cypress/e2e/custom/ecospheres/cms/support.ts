import { build, sequence } from 'mimicry-js'

import type { CmsPage } from '@/model/cms'
import { dinumOrganization } from 'cypress/support/factories/organizations_factory'
import { UserFactory } from 'cypress/support/factories/users_factory'

export const pageFactory = build<CmsPage>({
  fields: {
    id: sequence((n) => `id-page-${n}`),
    name: 'Sample Page',
    slug: sequence((n) => `sample-page-${n}`),
    description: null,
    blocs: [],
    tags: [],
    published: null,
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    uri: sequence((n) => `https://www.data.gouv.fr/api/1/pages/id-page-${n}/`),
    page: sequence((n) => `https://www.data.gouv.fr/pages/sample-page-${n}/`),
    permissions: { edit: true, delete: true },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union
    organization: dinumOrganization as any,
    owner: null
  }
})

// user-owned page to facilitate permission tests
export function createTestPage(overrides = {}): CmsPage {
  const owner = UserFactory.one({
    overrides: { id: 'test-user-id', first_name: 'Test', last_name: 'User' }
  })
  return pageFactory.one({
    overrides: { organization: null, owner, ...overrides }
  })
}
