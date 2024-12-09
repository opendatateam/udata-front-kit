import { icons } from '@iconify-json/ri'
import { getIconData } from '@iconify/utils'

export const useRemixIconProp = <T extends { icon?: unknown }>(
  iconName: string
) => {
  return {
    icon: useRemixIconData(iconName)
  } as T['icon']
}

export const useRemixIconData = (iconName: string) => {
  return getIconData(icons, iconName)
}
