import type { Owned } from '@datagouv/components-next'

import config from '@/config'

export const getOwnerAvatar = (object: Owned, size: number = 32): string => {
  if (object.owner?.avatar_thumbnail != null) {
    return object.owner.avatar_thumbnail
  }
  return `${config.datagouvfr.base_url}/api/1/avatars/${object.owner?.id}/${size}`
}
