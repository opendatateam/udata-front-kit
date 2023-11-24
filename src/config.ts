import config from '@siteConfig/config.yaml'

import type { SelectOption, Theme } from '@/model'

class ConfigUtils {
  public static getThemeOptions() {
    const options: SelectOption[] = []
    for (const theme of config.theme) {
      options.push({
        value: theme.name,
        text: theme.name
      })
    }
    return options
  }

  public static getSubthemeOptions(theme: Theme) {
    const options: SelectOption[] = []
    if (theme) {
      for (const subtheme of theme.subthemes) {
        options.push({
          value: subtheme.name,
          text: subtheme.name
        })
      }
    }
    return options
  }

  public static getThemeByName(name: string): Theme | null {
    for (const theme of config.themes) {
      if (theme.name === name) {
        return theme
      }
    }
    return null
  }
}

export default config
export { ConfigUtils }
