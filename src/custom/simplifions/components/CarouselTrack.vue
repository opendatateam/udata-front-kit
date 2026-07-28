<template>
  <ul ref="track" class="carousel__track fr-m-0 fr-p-0" @scroll.passive="onScroll">
    <slot />
  </ul>
  <div
    v-show="hasOverflow"
    class="fr-mt-2w fr-pb-2w fr-grid-row fr-grid-row--center"
  >
    <div class="carousel__nav">
      <button
        type="button"
        class="fr-link fr-link--sm fr-link--icon-left fr-icon-arrow-left-s-line fr-mr-2w"
        :disabled="!canPrev"
        @click="prev"
      >
        Précédent
      </button>
      <button
        type="button"
        class="fr-link fr-link--sm fr-link--icon-right fr-icon-arrow-right-s-line"
        :disabled="!canNext"
        @click="next"
      >
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const track = ref<HTMLElement | null>(null)
const scrollLeft = ref(0)
const scrollMax = ref(0)

const hasOverflow = computed(() => scrollMax.value > 0)
const canPrev = computed(() => scrollLeft.value > 4)
const canNext = computed(() => scrollLeft.value < scrollMax.value - 4)

const updateScrollState = () => {
  if (!track.value) return
  scrollMax.value = track.value.scrollWidth - track.value.clientWidth
  scrollLeft.value = track.value.scrollLeft
}

const onScroll = () => {
  if (!track.value) return
  scrollLeft.value = track.value.scrollLeft
}

const itemWidth = () => {
  const item = track.value?.firstElementChild as HTMLElement | null
  if (!item) return 300
  const gap = track.value
    ? parseFloat(getComputedStyle(track.value).columnGap) || 0
    : 0
  return item.offsetWidth + gap
}

const prev = () =>
  track.value?.scrollBy({ left: -itemWidth(), behavior: 'smooth' })
const next = () =>
  track.value?.scrollBy({ left: itemWidth(), behavior: 'smooth' })

const ro = new ResizeObserver(() => {
  updateScrollState()
})

onMounted(async () => {
  if (!track.value) return
  await nextTick()
  updateScrollState()
  ro.observe(track.value)
})

onUnmounted(() => ro.disconnect())

defineExpose({
  getEl: () => track.value,
  updateScrollState
})
</script>

<style scoped>
.carousel__track {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.carousel__track::-webkit-scrollbar {
  display: none;
}

.carousel__nav button:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
