import type { InjectionKey, Ref } from 'vue'
import { computed, inject, provide, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

interface DesignSectionMenuItem {
  id: string
  to: string
  text: string
  active: boolean
}

interface DesignGroupMenuItem {
  id: string
  text: string
  expanded: boolean
  menuItems: DesignSectionMenuItem[]
}

const DesignMenuKey: InjectionKey<Ref<DesignGroupMenuItem[]>> =
  Symbol('designMenu')
const DesignGroupKey: InjectionKey<DesignGroupMenuItem> = Symbol('designGroup')

// collects the groups and sections of the page as side menu items
export const provideDesignMenu = (): Ref<DesignGroupMenuItem[]> => {
  const menuItems = ref<DesignGroupMenuItem[]>([])
  provide(DesignMenuKey, menuItems)
  return menuItems
}

// adds a top level side menu entry, holding the sections rendered inside the group
export const useDesignGroup = (id: string, title: string) => {
  // reactive because DsfrSideMenuList toggles `expanded` directly on the item
  const group = reactive<DesignGroupMenuItem>({
    id: `design-group-${id}`,
    text: title,
    expanded: true,
    menuItems: []
  })
  inject(DesignMenuKey)!.value.push(group)
  provide(DesignGroupKey, group)
}

// lists a section in the side menu entry of its group
export const useDesignSection = (id: string, title: string) => {
  const route = useRoute()
  inject(DesignGroupKey)!.menuItems.push(
    reactive({
      id: `design-section-${id}`,
      to: `${route.path}#${id}`,
      text: title,
      active: computed(() => route.hash === `#${id}`)
    })
  )
}
