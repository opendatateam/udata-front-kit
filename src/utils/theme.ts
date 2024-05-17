import { ref, watchEffect, computed, type Ref, type ComputedRef } from 'vue'

import config from '@/config'
import type { ThemeSelectOption, Subtheme, Theme } from '@/model/theme'

const convertToHex = (hex: string): string => {
  return `#${parseInt(hex, 16).toString(16).padStart(6, '0')}`
}

export const getThemeByName = (themeName: string): Theme | undefined => {
  return config.themes.find((theme: Theme) => theme.name === themeName)
}

export const getThemeColor = (themeName: string): string => {
  const theme = getThemeByName(themeName)
  return theme?.color != null ? convertToHex(theme.color) : 'transparent'
}

export const getThemeTextColor = (themeName: string): string => {
  const theme = getThemeByName(themeName)
  return theme?.textColor != null ? convertToHex(theme.textColor) : '#000000b3'
}

export const getThemeOptions = (): ThemeSelectOption[] => {
  return config.themes.map((theme: Theme) => {
    return {
      value: theme.name,
      text: theme.name
    }
  })
}

export const getSubthemeOptions = (theme: Theme): ThemeSelectOption[] => {
  return theme.subthemes.map((subtheme: Subtheme) => {
    return {
      value: subtheme.name,
      text: subtheme.name
    }
  })
}

interface UseThemeOptionsReturn {
  themeOptions: ThemeSelectOption[]
  selectedTheme: Ref<Theme | undefined>
  subthemeOptions: ComputedRef<ThemeSelectOption[]>
}

/**
 * Handle theme and related subtheme options computing from a reactive theme name
 */
export function useThemeOptions(themeName: Ref<string>): UseThemeOptionsReturn {
  const themeOptions = getThemeOptions()

  const selectedTheme = ref<Theme | undefined>()

  watchEffect(() => {
    selectedTheme.value = getThemeByName(themeName.value)
  })

  const subthemeOptions = computed(() => {
    return selectedTheme.value != null
      ? getSubthemeOptions(selectedTheme.value)
      : []
  })

  return {
    themeOptions,
    selectedTheme,
    subthemeOptions
  }
}
