<script setup lang="ts">
import type { AxisValueDisplay } from './types'

const GROUPED_MODE = '__grouped__'

const props = defineProps<{
  availableAxisValues: Record<string, string[]>
  summable: boolean
  // Active axis's values, colors/order matching the chart (see
  // IndicatorVizChart.vue's activeAxisValues).
  activeAxisValues: AxisValueDisplay[]
}>()

const filters = defineModel<Record<string, string[]>>('filters', {
  required: true
})
const grouped = defineModel<Record<string, boolean>>('grouped', {
  required: true
})

const axisNames = computed(() => Object.keys(props.availableAxisValues))

const modeOptions = computed(() => [
  { value: GROUPED_MODE, label: 'Regroupé' },
  ...axisNames.value.map((axis) => ({ value: axis, label: `Par "${axis}"` }))
])

const activeAxis = computed(
  () => axisNames.value.find((axis) => grouped.value[axis] === false) ?? null
)

const mode = computed<string>({
  get: () => activeAxis.value ?? GROUPED_MODE,
  set: (value) => {
    grouped.value = Object.fromEntries(
      axisNames.value.map((axis) => [axis, axis !== value])
    )
  }
})

function toggleValue(axis: string, value: string, checked: boolean) {
  const current = filters.value[axis] ?? []
  filters.value = {
    ...filters.value,
    [axis]: checked ? [...current, value] : current.filter((v) => v !== value)
  }
}
</script>

<template>
  <!-- Each top-level block is its own flex item in the parent's .dropdowns
       row (see IndicatorVizChart.vue). Plain <fieldset>/<input>/<label>, not
       DsfrRadioButtonSet/DsfrCheckboxSet: their .fr-fieldset made width
       unpredictable in a flex column (flex-wrap + percentage flex-basis
       rows). Only the plain visual classes (.fr-radio-group/.fr-checkbox-group)
       are kept. -->
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
        <label class="fr-label" :for="`axis-mode-${option.value}`">{{
          option.label
        }}</label>
      </div>
    </div>
  </fieldset>

  <!-- Summable: only the axis picked above is filterable, in the chart's
       own order and colors, since the others are summed into the total. -->
  <fieldset v-if="summable && activeAxis" class="axis-values-block">
    <legend class="fr-sr-only">Valeurs de l'axe "{{ activeAxis }}"</legend>
    <p aria-hidden="true" class="axis-filters-title axis-filters-title--spacer">
      Valeur des axes
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
       no single color maps to one axis value. Plain checkboxes only. -->
  <template v-if="!summable">
    <fieldset v-for="axis in axisNames" :key="axis" class="axis-values-block">
      <legend class="fr-sr-only">Valeurs de l'axe "{{ axis }}"</legend>
      <p
        aria-hidden="true"
        class="axis-filters-title axis-filters-title--spacer"
      >
        Valeur des axes
      </p>
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
  margin-left: 2rem;
}

/* Claims the rest of the leftover width (5x .axis-mode-block's share).
   min-width:0 so long labels wrap instead of overflowing. */
.axis-values-block {
  flex: 1 1 0;
  min-width: 0;
}

.axis-filters-title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: var(--text-label-grey);
  margin: 0 0 0.5rem;
}

.axis-filters-title--spacer {
  visibility: hidden;
}

/* Both are row-layout-only concerns; not needed once columns stack. */
@media (max-width: 768px) {
  .axis-mode-block {
    margin-left: 0;
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
  /* Matches DSFR's own --sm checkbox glyph margin-top, so the swatch lines
     up visually with the check icon instead of the (taller) text line. */
  margin-top: 0.25rem;
  border-radius: 2px;
  flex-shrink: 0;
}

.axis-value-text {
  flex: 1;
  min-width: 0;
}
</style>
