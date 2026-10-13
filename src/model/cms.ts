import type { Owned, PageBloc } from '@datagouv/components-next'

// a user-or-org owned Post with kind "external_page" (distinct from this app's own PageConf/PageObjectType)
export type CmsPage = Owned & {
  id: string
  name: string
  slug: string
  // used as the SEO meta description
  headline: string | null
  kind: 'external_page'
  body_type: 'blocs'
  blocs: PageBloc[]
  tags: string[]
  // null means draft; set via POST/DELETE /posts/:id/publish/, not writable via PUT
  published: string | null
  created_at: string
  last_modified: string
  uri: string
  page: string | null
  permissions: { edit: boolean; delete: boolean }
}
