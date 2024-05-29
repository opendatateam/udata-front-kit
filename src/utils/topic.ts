import {
  Availability,
  type Topic,
  type EcospheresTopicExtras,
  type TopicExtras
} from '@/model/topic'

export const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}

export const updateExtras = (
  topic: Topic,
  data: Partial<EcospheresTopicExtras>
): TopicExtras => {
  return {
    ...topic.extras,
    ecospheres: {
      ...topic.extras.ecospheres,
      ...data
    }
  }
}
