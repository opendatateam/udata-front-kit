<template>
  <section
    v-if="props.entries.length > 0"
    class="topics-carousel fr-mt-6w fr-py-5w"
    :style="{ backgroundImage: gradient }"
  >
    <div class="fr-container">
      <h2 class="fr-h5 fr-mb-3w">Sont mentionnés dans cet article :</h2>

      <CarouselTrack ref="carouselRef" :on-resize="() => alignHeaderHeights()">
        <li
          v-for="entry in props.entries"
          :key="entry.slug"
          class="carousel__item"
        >
          <SimplifionsSolutionCard
            v-if="entry.pageKey === 'solutions'"
            :topic="entry.topic as TopicSolution"
            :page-key="entry.pageKey"
            :show-description="false"
            :show-image="true"
            :show-fournisseurs="false"
            :show-simplification-tags="false"
          />
          <SimplifionsCasDusageCard
            v-else
            :topic="entry.topic as TopicCasUsage"
            :page-key="entry.pageKey"
            :show-description="false"
            :show-fournisseurs="false"
            :show-simplification-tags="false"
          />
        </li>
      </CarouselTrack>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TopicCasUsage, TopicSolution } from '../../model/topics'
import CarouselTrack from '../CarouselTrack.vue'
import SimplifionsCasDusageCard from '../SimplifionsCasDusageCard.vue'
import SimplifionsSolutionCard from '../SimplifionsSolutionCard.vue'
import type { ArticleTopicEntry } from './articleTopicsRegistryKey'

const props = defineProps<{
  entries: readonly ArticleTopicEntry[]
  gradient?: string
}>()

const carouselRef = ref<InstanceType<typeof CarouselTrack> | null>(null)

watch(
  () => props.entries.map((e) => e.slug),
  async (slugs) => {
    if (slugs.length === 0) return
    await nextTick()
    const el = carouselRef.value?.getEl()
    if (el) el.scrollLeft = 0
    carouselRef.value?.updateScrollState()
    alignHeaderHeights()
  },
  { immediate: true }
)

const alignHeaderHeights = () => {
  const el = carouselRef.value?.getEl()
  if (!el) return
  const headers = Array.from(el.querySelectorAll<HTMLElement>('.header-topic'))
  headers.forEach((h) => (h.style.height = ''))
  const max = Math.max(...headers.map((h) => h.offsetHeight))
  if (max > 0) headers.forEach((h) => (h.style.height = `${max}px`))
}
</script>

<style scoped>
.topics-carousel {
  background-color: #1b1b35;
  background-size: cover;
}

.topics-carousel :deep(.fr-link:hover),
.topics-carousel :deep(.fr-link:focus) {
  background-color: transparent;
}

.carousel__item {
  flex: 0 0 280px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
}

.carousel__item :deep(.simplifions-card-link) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 0;
}

.carousel__item :deep(.fr-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.carousel__item :deep(.fr-card__body) {
  flex: 1;
}

.carousel__item :deep(.topic-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.carousel__item :deep(.header-topic) {
  min-height: unset;
}
</style>
