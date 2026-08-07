<script setup lang="ts">
import type { AxisValueDisplay } from './types'

const GROUPED_MODE = '__grouped__'

const props = defineProps<{
  availableAxisValues: Record<string, string[]>
  summable: boolean
  // The active axis's values with the exact color and order the chart gives
  // them (see IndicatorVizChart.vue's series/activeAxisValues). The chart
  // hides rather than removes unchecked values, so this list - and its
  // colors - stay stable no matter what's currently checked.
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
  <!-- Each top-level block below is its own flex item in the parent's
       .dropdowns row (see IndicatorVizChart.vue), so selects/radios/values
       share the available width evenly instead of the values list wrapping
       under the radios when its labels are long.
       Plain <fieldset>/<input>/<label> throughout, not DsfrRadioButtonSet/
       DsfrCheckboxSet: DSFR's own .fr-fieldset ships with flex-wrap and
       percentage flex-basis on its rows, which made width unpredictable in
       a flex/grid column context. Only the simple visual classes
       (.fr-radio-group/.fr-checkbox-group, no layout of their own) are kept. -->
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
   as breathing room - most of it goes to .axis-values-block below - see
   .dropdowns in IndicatorVizChart.vue for the row this shares space in.
   That leftover share varies with how many columns are competing for it
   (bigger alone in "Regroupé" mode than once .axis-values-block appears),
   so a fixed margin-left is used for visual separation from the first
   column instead of centering: centering content within a width that
   changes size made it visibly jump between modes, a fixed margin doesn't. */
.axis-mode-block {
  flex: 0.2 1 auto;
  margin-left: 2rem;
}

/* Starts from nothing (flex-basis:0) and claims the rest of the leftover
   width, at 5x the rate of .axis-mode-block above. min-width:0 lets it
   shrink below its content's natural width so long labels wrap instead of
   overflowing (flex items default to min-width:auto). */
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

/* Both only make sense in the row layout: the margin-left is separation
   from the first column, and the spacer only reserves height to line up
   with .axis-mode-block's title when columns sit side by side. Stacked
   below the breakpoint, neither applies - the spacer is removed from flow
   entirely (not just hidden) so it doesn't waste vertical space. */
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

/* DSFR's own label rule (.fr-checkbox-group input[type=checkbox] + label)
   sets align-items:center, right for a single-line label but it pushes the
   swatch to the vertical middle of a wrapped multi-line one. Matching that
   selector's shape (rather than just ".axis-value-label") makes ours the
   more specific of the two, so it actually wins instead of silently losing
   to DSFR's default. */
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
