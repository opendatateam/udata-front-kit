import type { User } from '@datagouv/components-next'
import { build } from 'mimicry-js'

export const UserFactory = build<User>({
  fields: {
    id: 'default-user-id',
    first_name: 'Default',
    last_name: 'User',
    slug: 'default-user',
    about: '',
    page: '',
    uri: '',
    avatar: '',
    avatar_thumbnail: '',
    since: new Date().toISOString(),
    organizations: [],
    last_login_at: null,
    metrics: {
      datasets: 0,
      dataservices: 0,
      reuses: 0,
      followers: 0,
      following: 0
    }
  }
})
