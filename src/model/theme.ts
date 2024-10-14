export interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
  textColor?: string
}

export interface Subtheme {
  name: string
}

export interface ThemeSelectOption {
  value: string
  text: string
  disabled?: boolean
}

export interface ThemeColors {
  color: string
  background: string
}

export const NoOptionSelected = 'no_option_selected'
