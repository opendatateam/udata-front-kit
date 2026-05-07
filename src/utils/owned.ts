import type { Topic } from '@/model/topic'
import {
  getOwnerName,
  type Dataservice,
  type DatasetV2,
  type TopicV2
} from '@datagouv/components-next'

// This is a redefinition of the previous function from @datagouv/components
export const useOwnerName = (
  object: DatasetV2 | Topic | TopicV2 | Dataservice | null
): ComputedRef<string | undefined> => {
  return computed(() => {
    if (object) {
      return getOwnerName(object)
    }
  })
}
