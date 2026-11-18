import type { InjectionKey, Ref } from 'vue'
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref
} from 'vue'
import { useRoute } from 'vue-router'

interface DesignSectionMenuItem {
  id: string
  to: string
  text: string
  active: boolean
}

export interface DesignGroupMenuItem {
  id: string
  text: string
  expanded: boolean
  active: boolean
  menuItems: DesignSectionMenuItem[]
}

const DesignMenuKey: InjectionKey<Ref<DesignGroupMenuItem[]>> =
  Symbol('designMenu')
const DesignGroupKey: InjectionKey<DesignGroupMenuItem> = Symbol('designGroup')

/**
 * Collects the groups and sections of the current page as side menu items
 */
export const provideDesignMenu = (): Ref<DesignGroupMenuItem[]> => {
  const menuItems = ref<DesignGroupMenuItem[]>([])
  provide(DesignMenuKey, menuItems)
  return menuItems
}

/**
 * Adds a top level side menu entry, holding the sections rendered inside the group
 */
export const useDesignGroup = (id: string, title: string) => {
  const menuItems = inject(DesignMenuKey, undefined)
  // reactive because DsfrSideMenuList toggles `expanded` directly on the item
  const group: DesignGroupMenuItem = reactive({
    id: `design-group-${id}`,
    text: title,
    expanded: true,
    active: computed(() => group.menuItems.some((item) => item.active)),
    menuItems: [] as DesignSectionMenuItem[]
  })
  menuItems?.value.push(group)
  provide(DesignGroupKey, group)

  onBeforeUnmount(() => {
    if (!menuItems) return
    menuItems.value = menuItems.value.filter((item) => item.id !== group.id)
  })
}

/**
 * Lists a section in its group side menu entry while it is mounted
 */
export const useDesignSection = (id: string, title: string) => {
  const group = inject(DesignGroupKey, undefined)
  const route = useRoute()
  const itemId = `design-section-${id}`

  onMounted(() => {
    group?.menuItems.push(
      reactive({
        id: itemId,
        to: `${route.path}#${id}`,
        text: title,
        active: computed(() => route.hash === `#${id}`)
      })
    )
    // the router can't scroll to a section that wasn't rendered yet on page load
    if (route.hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView()
    }
  })
  onBeforeUnmount(() => {
    if (!group) return
    group.menuItems = group.menuItems.filter((item) => item.id !== itemId)
  })
}
