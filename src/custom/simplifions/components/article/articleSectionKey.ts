import type { InjectionKey } from 'vue'

export const articleSectionKey: InjectionKey<(id: string, label: string) => void> =
  Symbol('articleSection')
