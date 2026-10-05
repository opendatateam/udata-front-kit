import type { Owned, PageBloc } from '@datagouv/components-next'

// the backend's Page model (not to be confused with PageConf/PageObjectType,
// which describe this app's own search/listing pages)
export type CmsPage = Owned & {
  id: string
  name: string
  slug: string
  description: string | null
  blocs: PageBloc[]
  tags: string[]
  // null means draft; set via POST/DELETE /pages/:id/publish/, not writable via PUT
  published: string | null
  created_at: string
  last_modified: string
  uri: string
  page: string | null
  permissions: { edit: boolean; delete: boolean }
}
