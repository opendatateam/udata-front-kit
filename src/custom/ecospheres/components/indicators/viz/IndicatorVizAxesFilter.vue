<script setup lang="ts">
import VIconDsfr from '@/components/VIconDsfr.vue'
import type { AxisValueDisplay } from './types'

const GROUPED_MODE = '__grouped__'

const props = defineProps<{
  availableAxisValues: Record<string, string[]>
  summable: boolean
  activeAxisValues: AxisValueDisplay[]
}>()

const filters = defineModel<Record<string, string[]>>('filters', {
  required: true
})
// The axis currently split into its own series; null when not summable
// (guaranteed by the parent, which owns the summable check).
const activeAxis = defineModel<string | null>('activeAxis', { required: true })

const axisNames = computed(() => Object.keys(props.availableAxisValues))

const modeOptions = computed(() => [
  { value: GROUPED_MODE, label: 'Regroupé' },
  ...axisNames.value.map((axis) => ({ value: axis, label: `Par "${axis}"` }))
])

const mode = computed<string>({
  get: () => activeAxis.value ?? GROUPED_MODE,
  set: (value) => {
    activeAxis.value = value === GROUPED_MODE ? null : value
  }
})

// Not summable: no "Regroupé" choice, so the mode block becomes an
// explanation instead of radios.
const notSummableExplanation = computed(() =>
  axisNames.value.length === 1
    ? "Une série par valeur de l'axe : ces valeurs ne peuvent pas être additionnées."
    : 'Une série par combinaison des axes : ces valeurs ne peuvent pas être additionnées.'
)

// Drives "is being filtered" cue on axis title.
function isAxisPartiallyFiltered(axis: string): boolean {
  const available = props.availableAxisValues[axis]
  if (!available) return false
  return (filters.value[axis]?.length ?? 0) !== available.length
}

function toggleValue(axis: string, value: string, checked: boolean) {
  const current = filters.value[axis] ?? []
  filters.value = {
    ...filters.value,
    [axis]: checked ? [...current, value] : current.filter((v) => v !== value)
  }
}
</script>

<template>
  <!-- Not using vue-dsfr components because fieldset styles will fight our layout -->
  <fieldset v-if="axisNames.length > 0" class="axis-mode-block">
    <legend class="fr-sr-only">Afficher le graphe</legend>
    <p aria-hidden="true" class="axis-filters-title">Afficher le graphe</p>
    <div v-if="summable" class="axis-options">
      <div
        v-for="option in modeOptions"
        :key="option.value"
        class="fr-radio-group fr-radio-group--sm"
      >
        <input
          :id="`axis-mode-${option.value}`"
          v-model="mode"
          type="radio"
          name="axis-display-mode"
          :value="option.value"
        />
        <label class="fr-label" :for="`axis-mode-${option.value}`">
          <span class="axis-mode-label">
            {{ option.label }}
            <template v-if="isAxisPartiallyFiltered(option.value)">
              <VIconDsfr
                name="filter-fill"
                small
                class="axis-filtered-icon"
                title="Des valeurs de cet axe sont exclues et affectent les totaux"
              />
              <span class="fr-sr-only">(valeurs filtrées)</span>
            </template>
          </span>
        </label>
      </div>
    </div>
    <p v-else class="fr-hint-text">{{ notSummableExplanation }}</p>
  </fieldset>

  <!-- Summable: only the axis picked above is filterable, in the chart's
       own order and colors, since the others are summed into the total.
       axisNames.includes guards against a stale activeAxis from a mesh
       switch that leaves no axes at all (e.g. commune). -->
  <fieldset
    v-if="summable && activeAxis && axisNames.includes(activeAxis)"
    class="axis-values-block"
  >
    <legend class="fr-sr-only">Valeurs de l'axe "{{ activeAxis }}"</legend>
    <p aria-hidden="true" class="axis-filters-title axis-filters-title--spacer">
      &nbsp;
    </p>
    <div class="axis-options">
      <div
        v-for="item in activeAxisValues"
        :key="item.value"
        class="fr-checkbox-group fr-checkbox-group--sm"
      >
        <input
          :id="`axis-value-${activeAxis}-${item.value}`"
          type="checkbox"
          :checked="(filters[activeAxis] ?? []).includes(item.value)"
          @change="
            toggleValue(
              activeAxis,
              item.value,
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <label class="fr-label" :for="`axis-value-${activeAxis}-${item.value}`">
          <span
            class="axis-value-swatch"
            :style="{ backgroundColor: item.color }"
          />
          <span class="axis-value-text">{{ item.value }}</span>
        </label>
      </div>
    </div>
  </fieldset>

  <!-- Not summable: every combination of axis values is its own series, so
       no single color maps to one axis value. Plain checkboxes, headed by
       the axis name since there's no radio for it. -->
  <template v-if="!summable">
    <fieldset
      v-for="axis in axisNames"
      :key="axis"
      class="axis-values-block axis-values-block--compact"
    >
      <legend class="fr-sr-only">Valeurs de l'axe "{{ axis }}"</legend>
      <p aria-hidden="true" class="axis-values-title">Axe "{{ axis }}"</p>
      <div class="axis-options">
        <div
          v-for="value in availableAxisValues[axis]"
          :key="value"
          class="fr-checkbox-group fr-checkbox-group--sm"
        >
          <input
            :id="`axis-value-${axis}-${value}`"
            type="checkbox"
            :checked="(filters[axis] ?? []).includes(value)"
            @change="
              toggleValue(
                axis,
                value,
                ($event.target as HTMLInputElement).checked
              )
            "
          />
          <label class="fr-label" :for="`axis-value-${axis}-${value}`">{{
            value
          }}</label>
        </div>
      </div>
    </fieldset>
  </template>
</template>

<style scoped>
/* Reset the browser's default fieldset styling: we're using <fieldset> for
   its semantics (grouping + legend), not its box/border. */
.axis-mode-block,
.axis-values-block {
  margin: 0;
  padding: 0;
  border: 0;
}

/* Starts at content size, then gets a small share of any leftover row width
   as breathing room (0.1) */
.axis-mode-block {
  flex: 0.1 1 auto;
  max-width: 14rem;
  margin-left: 2rem;
}

/* Claims the rest of the leftover width (10x .axis-mode-block's share).
   min-width:0 so long labels wrap instead of overflowing. */
.axis-values-block {
  flex: 1 1 0;
  min-width: 0;
}

.axis-values-block--compact {
  flex: 0 1 auto;
  max-width: 11rem;
}

.axis-filters-title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: var(--text-label-grey);
  margin: 0 0 0.5rem;
}

.axis-values-title {
  font-size: 0.875rem;
  line-height: 1.5rem;
  margin: 0 0 0.5rem;
}

.axis-filters-title--spacer {
  visibility: hidden;
}

/* Both are row-layout-only concerns; not needed once columns stack. */
@media (max-width: 768px) {
  .axis-mode-block {
    max-width: none;
    margin-left: 0;
  }

  .axis-values-block--compact {
    max-width: none;
  }

  .axis-filters-title--spacer {
    display: none;
  }
}

.axis-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Overrides DSFR's align-items:center, which centers the swatch on a
   wrapped multi-line label instead of aligning it to the first line. Matches
   DSFR's own selector shape to win on specificity. */
.axis-values-block .fr-checkbox-group input[type='checkbox'] + label {
  align-items: flex-start;
}

.axis-value-swatch {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  margin-top: 0.25rem;
  border-radius: 2px;
  flex-shrink: 0;
}

.axis-value-text {
  flex: 1;
  min-width: 0;
}

/* DSFR's radio label is flex-direction:column; wrap to keep icon inline. */
.axis-mode-label {
  display: inline-flex;
  align-items: center;
}

.axis-filtered-icon {
  color: var(--text-mention-grey);
  margin-left: 0.25rem;
}
</style>
