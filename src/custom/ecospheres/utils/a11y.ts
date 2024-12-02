import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { computed, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

// TODO: use this on BouquetsListView and DatasetsListView
export const useAccessibilityProperties = (
  query: Ref<string>,
  searchResultsMessage: ComputedRef<string>
) => {
  const route = useRoute()

  const setAccessibilityProperties = inject(
    AccessibilityPropertiesKey
  ) as AccessibilityPropertiesType

  const pageTitle = computed(() => {
    if (query.value) {
      return `${route.meta.title} pour "${query.value}"`
    }
    return route.meta.title
  })

  watch([pageTitle, searchResultsMessage], () => {
    setAccessibilityProperties(pageTitle.value, false, [
      {
        text: searchResultsMessage.value
      }
    ])
  })
}
