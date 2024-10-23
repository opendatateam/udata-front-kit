import type { Organization, User } from '@datagouv/components'

export type ExtendedUser = User & {
  organizations: Organization[]
}
