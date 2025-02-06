// FIXME: remove all this

import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'

import config from '@/config'
import type { Subtheme, Theme, ThemeColors } from '@/model/theme'

export const getThemeByName = (themeName: string): Theme => {
  return config.themes.find((theme: Theme) => theme.name === themeName)
}

export const getThemeColor = (themeName: string): string => {
  const theme = getThemeByName(themeName)
  return theme.color ?? 'transparent'
}

export const getThemeTextColor = (themeName: string): string => {
  const theme = getThemeByName(themeName)
  return theme.textColor ?? '#000000b3'
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
  themeColors: ComputedRef<ThemeColors>
}

/**
 * Handle theme and related subtheme options computing from a reactive theme name
 */
export function useThemeOptions(
  themeName: Ref<string | undefined>
): UseThemeOptionsReturn {
  const themeOptions = getThemeOptions()

  const selectedTheme = ref<Theme | undefined>()

  watchEffect(() => {
    if (themeName.value !== undefined) {
      selectedTheme.value = getThemeByName(themeName.value)
    }
  })

  const subthemeOptions = computed(() => {
    return selectedTheme.value != null
      ? getSubthemeOptions(selectedTheme.value)
      : []
  })

  const themeColors = computed(() => {
    if (selectedTheme.value != null) {
      const textColor = getThemeTextColor(selectedTheme.value.name)
      const bgColor = getThemeColor(selectedTheme.value.name)
      return {
        color: textColor,
        background: bgColor
      }
    }
    return {
      color: '#000000b3',
      background: 'transparent'
    }
  })

  return {
    themeOptions,
    selectedTheme,
    subthemeOptions,
    themeColors
  }
}
