import type { InfoToAnnounce } from '@/components/LiveRegion.vue'
import type { InjectionKey } from 'vue'

export type AccessibilityPropertiesType = (
  title?: string,
  focus?: boolean,
  messages?: InfoToAnnounce[]
) => void

export const AccessibilityPropertiesKey: InjectionKey<AccessibilityPropertiesType> =
  Symbol('setAccessibilityProperties')
