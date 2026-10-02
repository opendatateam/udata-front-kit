import type { Owned, PageBloc } from '@datagouv/components-next'

// the backend's Page model (not to be confused with PageConf/PageObjectType,
// which describe this app's own search/listing pages)
export type CmsPage = Owned & {
  id: string
  name: string
  slug: string
  blocs: PageBloc[]
  tags: string[]
  // the topic this page is attached to, used to scope the CMS page list to a site
  topic: { id: string } | null
  private: boolean
  created_at: string
  last_modified: string
  uri: string
  page: string | null
  permissions: { edit: boolean; delete: boolean }
}
