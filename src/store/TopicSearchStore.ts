import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { createSearchStore } from './GenericSearchStore'

const searchAPI = new TopicsAPI()

export const useTopicSearchStore = createSearchStore<Topic>({
  storeName: 'topicSearch',
  defaultPageKey: 'bouquets',
  searchAPI,
  maxTotal: null
})
