<template>
  <section v-if="resolvedEntries.length > 0" class="topics-carousel fr-mt-6w fr-py-5w" :style="{ backgroundImage: gradient }">
    <div class="fr-container fr-mb-3w">
      <h2 class="fr-h5 fr-mb-0">
        Sont mentionnés dans cet article :
      </h2>
    </div>
    <div ref="track" class="topics-carousel__track-wrapper" @scroll.passive="onScroll">
      <ul class="topics-carousel__track fr-container fr-pb-3w" role="list">
        <li
          v-for="entry in resolvedEntries"
          :key="entry.slug"
          class="topics-carousel__item"
        >
          <SimplifionsSolutionCard
            v-if="entry.pageKey === 'solutions'"
            :topic="entry.topic as TopicSolution"
            :page-key="entry.pageKey"
            :show-description="false"
            :show-image="true"
            :show-fournisseurs="false"
            :show-simplification-tags="false"/>
          <SimplifionsCasDusageCard
            v-else
            :topic="entry.topic as TopicCasUsage"
            :page-key="entry.pageKey"
            :show-description="false"
            :show-fournisseurs="false"
            :show-simplification-tags="false"
          />
        </li>
      </ul>
    </div>
    <div v-show="hasOverflow" class="fr-container fr-mt-2w fr-pb-2w fr-grid-row fr-grid-row--center">
      <button
        class="fr-link fr-link--sm fr-link--icon-left fr-icon-arrow-left-s-line fr-mr-2w"
        aria-label="Précédent"
        :disabled="!canPrev"
        @click="prev"
      >
        Précédent
      </button>
      <button
        class="fr-link fr-link--sm fr-link--icon-right fr-icon-arrow-right-s-line"
        aria-label="Suivant"
        :disabled="!canNext"
        @click="next"
      >
        Suivant
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ArticleTopicEntry } from './articleTopicsRegistryKey'
import type { TopicCasUsage, TopicSolution } from '../../model/topics'
import type { Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import SimplifionsSolutionCard from '../SimplifionsSolutionCard.vue'
import SimplifionsCasDusageCard from '../SimplifionsCasDusageCard.vue'
import { useCarouselScroll } from '../../composables/useCarouselScroll'

const props = defineProps<{
  entries: readonly ArticleTopicEntry[]
  gradient?: string
}>()

const topicStore = useTopicStore()
const topics = shallowRef<(TopicSolution | TopicCasUsage)[]>([])
const shuffledEntries = shallowRef<ArticleTopicEntry[]>([])

watch(
  () => props.entries.map((e) => e.slug),
  async (slugs) => {
    if (slugs.length === 0) return
    const results = await Promise.allSettled(
      slugs.map((slug) => topicStore.load(slug, { toasted: false }))
    )
    const loaded = results
      .filter((r): r is PromiseFulfilledResult<Topic> => r.status === 'fulfilled')
      .map((r) => r.value as unknown as TopicSolution | TopicCasUsage)
    topics.value = loaded

    const loadedSlugs = new Set(loaded.map((t) => t.slug))
    shuffledEntries.value = [...props.entries]
      .filter((e) => loadedSlugs.has(e.slug))
      .sort(() => Math.random() - 0.5)

    await nextTick()
    updateScrollState()
    alignHeaderHeights()
  },
  { immediate: true }
)

const resolvedEntries = computed(() =>
  shuffledEntries.value.flatMap((entry) => {
    const topic = topics.value.find((t) => t.slug === entry.slug)
    return topic ? [{ ...entry, topic }] : []
  })
)

// Navigation
const { track, hasOverflow, canPrev, canNext, onScroll, prev, next, updateScrollState } =
  useCarouselScroll('.topics-carousel__item', () => alignHeaderHeights())

const alignHeaderHeights = () => {
  if (!track.value) return
  const headers = Array.from(
    track.value.querySelectorAll<HTMLElement>('.header-topic')
  )
  headers.forEach((h) => (h.style.height = ''))
  const max = Math.max(...headers.map((h) => h.offsetHeight))
  if (max > 0) headers.forEach((h) => (h.style.height = `${max}px`))
}
</script>

<style scoped>
/* fond de fallback + dégradé passé en inline style */
.topics-carousel {
  background-color: #1b1b35;
  background-size: cover;
}

.topics-carousel .fr-link:hover,
.topics-carousel .fr-link:focus {
  background-color: transparent !important;
}

/* conteneur scrollable horizontal */
.topics-carousel__track-wrapper {
  overflow-x: auto;
  scrollbar-width: none;
}
.topics-carousel__track-wrapper::-webkit-scrollbar {
  display: none;
}

/* piste flex nowrap + scroll snap */
.topics-carousel__track {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 1rem;
  list-style: none;
  margin: 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

/* carte à largeur fixe */
.topics-carousel__item {
  flex: 0 0 280px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
}

.topics-carousel__item :deep(.simplifions-card-link) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 0;
}

.topics-carousel__item :deep(.fr-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topics-carousel__item :deep(.fr-card__body) {
  flex: 1;
}

.topics-carousel__item :deep(.topic-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background-default-grey);
}

.topics-carousel__item :deep(.header-topic) {
  min-height: unset;
}
</style>
