<script setup lang="ts">
import type { SpatialCoverage } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { debounceWait } from '@/utils/config'
import { useDebounceFn } from '@vueuse/core'

const MIN_CHARS = 2
const MAX_RESULTS = 8

// short badge labels: names from /spatial/levels are too long (e.g. "Intercommunalité française (EPCI)")
const LEVEL_LABELS: Record<string, string> = {
  'country-group': 'Groupe de pays',
  country: 'Pays',
  'country-subset': 'Pays',
  'fr:region': 'Région',
  'fr:departement': 'Département',
  'fr:arrondissement': 'Arrondissement',
  'fr:epci': 'EPCI',
  'fr:canton': 'Canton',
  'fr:commune': 'Commune',
  'fr:iris': 'IRIS',
  'fr:collectivite': 'Collectivité'
}

const props = defineProps<{
  id: string
  label: string
  hint?: string
  placeholder?: string
}>()

const zone = defineModel<SpatialCoverage | null>({ default: null })

const api = new SpatialAPI()

const query = ref(zone.value?.name ?? '')
const results = ref<SpatialCoverage[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
const activeIndex = ref(-1)

const listboxId = computed(() => `${props.id}-listbox`)
const optionId = (index: number) => `${props.id}-option-${index}`
const activeDescendant = computed(() =>
  isOpen.value && activeIndex.value >= 0
    ? optionId(activeIndex.value)
    : undefined
)
const showEmpty = computed(
  () => !isLoading.value && query.value.trim().length >= MIN_CHARS
)

let lastRequest = 0
const fetchSuggestions = useDebounceFn(async (q: string) => {
  // input changed (e.g. cleared) since this call was scheduled
  if (query.value.trim() !== q) return
  const requestId = ++lastRequest
  try {
    const zones = await api.suggestZones(q, { size: MAX_RESULTS })
    // drop responses superseded by a newer query
    if (requestId !== lastRequest) return
    results.value = zones
    activeIndex.value = -1
  } catch (error) {
    console.error('Territory suggest error', error)
    if (requestId === lastRequest) results.value = []
  } finally {
    if (requestId === lastRequest) isLoading.value = false
  }
}, debounceWait)

const onInput = () => {
  // typing invalidates the previous selection
  zone.value = null
  const q = query.value.trim()
  if (q.length < MIN_CHARS) {
    lastRequest++
    results.value = []
    isLoading.value = false
    isOpen.value = false
    return
  }
  isOpen.value = true
  // set before the debounce so the empty state doesn't flash
  isLoading.value = true
  fetchSuggestions(q)
}

const select = (selected: SpatialCoverage) => {
  // discard in-flight responses, whose finally won't reset loading anymore
  lastRequest++
  isLoading.value = false
  zone.value = selected
  query.value = selected.name
  isOpen.value = false
  activeIndex.value = -1
}

const move = (step: number) => {
  if (!isOpen.value) {
    if (results.value.length) isOpen.value = true
    return
  }
  const count = results.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + step + count) % count
}

const onEnter = (event: KeyboardEvent) => {
  // Enter picks the highlighted option instead of submitting the form
  if (isOpen.value && activeIndex.value >= 0) {
    event.preventDefault()
    select(results.value[activeIndex.value])
  }
}

const close = () => {
  isOpen.value = false
  activeIndex.value = -1
}

watch(zone, (value) => {
  if (value) query.value = value.name
})
</script>

<template>
  <div class="fr-input-group territory-select">
    <label class="fr-label" :for="id">
      {{ label }}
      <span v-if="hint" class="fr-hint-text">{{ hint }}</span>
    </label>
    <div class="fr-input-wrap fr-icon-map-pin-2-line">
      <input
        :id="id"
        v-model="query"
        class="fr-input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendant"
        :placeholder="placeholder"
        @input="onInput"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter="onEnter"
        @keydown.esc="close"
        @blur="close"
      />
    </div>
    <div v-show="isOpen" class="territory-select__popover">
      <ul :id="listboxId" role="listbox" :aria-label="label">
        <li
          v-for="(result, index) in results"
          :id="optionId(index)"
          :key="result.id"
          role="option"
          :aria-selected="index === activeIndex"
          :class="{ 'is-active': index === activeIndex }"
          @mousedown.prevent="select(result)"
        >
          <span>
            {{ result.name }}
            <span class="territory-select__code">({{ result.code }})</span>
          </span>
          <span class="fr-badge fr-badge--sm">
            {{ LEVEL_LABELS[result.level] ?? result.level }}
          </span>
        </li>
      </ul>
      <p v-if="isLoading" class="territory-select__status" aria-live="polite">
        Recherche en cours…
      </p>
      <p
        v-else-if="showEmpty && !results.length"
        class="territory-select__status"
        aria-live="polite"
      >
        Aucun territoire ne correspond.
      </p>
      <p class="fr-message fr-message--info territory-select__info">
        Les données des territoires qui l'englobent (région, France…) sont aussi
        incluses.
      </p>
    </div>
  </div>
</template>

<style scoped>
.territory-select {
  position: relative;
}

.territory-select .fr-input {
  min-height: 3rem;
  font-size: 1.125rem;
}

.territory-select__popover {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 0.25rem;
  background-color: var(--background-overlap-grey);
  box-shadow: 0 6px 18px 0 rgb(0 0 18 / 16%);
}

.territory-select__popover ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.territory-select__popover li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 3rem;
  margin: 0;
  padding: 0.75rem 1rem;
  box-shadow: inset 0 -1px 0 0 var(--border-default-grey);
  cursor: pointer;
}

.territory-select__popover li:hover,
.territory-select__popover li.is-active {
  background-color: var(--background-overlap-grey-hover);
}

.territory-select__code,
.territory-select__status {
  color: var(--text-mention-grey);
}

.territory-select__status {
  margin: 0;
  padding: 0.75rem 1rem;
  box-shadow: inset 0 -1px 0 0 var(--border-default-grey);
}

.territory-select__info {
  margin: 0;
  padding: 0.75rem 1rem;
}
</style>
