import type { Ref } from 'vue'

import config from '@/config'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { useUserStore } from '@/store/UserStore'

// single source of truth for "can this user manage CMS pages"
export const hasCmsAccess = async (): Promise<boolean> => {
  const userStore = useUserStore()
  await userStore.waitForStoreInit()
  if (!config.website.cms?.enabled || !userStore.isLoggedIn) return false
  const topic = await useCmsPageStore().loadCmsTopic()
  return topic != null && userStore.hasEditPermissions(topic)
}

// reactive wrapper for hasCmsAccess(), re-evaluated on login state changes
export const useCmsAccess = (): Ref<boolean> => {
  const userStore = useUserStore()
  const canManage = ref(false)
  watchEffect(async () => {
    canManage.value = userStore.isLoggedIn ? await hasCmsAccess() : false
  })
  return canManage
}
