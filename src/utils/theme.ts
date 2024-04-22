import config from '@/config'
import type { Theme } from '@/model'

const getTheme = (themeName: string): Theme | undefined => {
  return config.themes.find((theme: Theme) => theme.name === themeName)
}

const convertToHex = (hex: string): string => {
  return `#${parseInt(hex, 16).toString(16).padStart(6, '0')}`
}

export const getThemeColor = (themeName: string): string => {
  const theme = getTheme(themeName)
  return theme?.color != null ? convertToHex(theme.color) : 'transparent'
}

export const getThemeTextColor = (themeName: string): string => {
  const theme = getTheme(themeName)
  return theme?.textColor != null ? convertToHex(theme.textColor) : '#000000b3'
}
