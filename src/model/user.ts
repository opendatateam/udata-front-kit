import type { User, Organization } from '@etalab/data.gouv.fr-components'

export type ExtendedUser = User & {
  organizations: Organization[]
}
