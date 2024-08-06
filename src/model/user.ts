import type { User, Organization } from '@datagouv/components'

export type ExtendedUser = User & {
  organizations: Organization[]
}
