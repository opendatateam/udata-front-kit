import type { Ref, ShallowRef } from 'vue'
import type { Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'

export const useTopicsBySlug = <T extends Topic>(
  slugs: string[]
): { topics: ShallowRef<T[]>; loading: Ref<boolean> } => {
  const topicStore = useTopicStore()
  const topics = shallowRef<T[]>([])
  const loading = ref(true)

  onMounted(async () => {
    const results = await Promise.allSettled(
      slugs.map((slug) => topicStore.load(slug, { toasted: false }))
    )
    topics.value = results
      .filter((r): r is PromiseFulfilledResult<Topic> => r.status === 'fulfilled')
      .map((r) => r.value as T)
    loading.value = false
  })

  return { topics, loading }
}
