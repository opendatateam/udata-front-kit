<script setup lang="ts">
import { useRandomId } from '@gouvminint/vue-dsfr'
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

const titleId = useRandomId('axis-filters-title')

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

function setAxisValues(axis: string, values: string[]) {
  filters.value = { ...filters.value, [axis]: values }
}

// A real, on-screen id for each values fieldset's accessible name: the
// visual spacer below is aria-hidden (it exists only to reserve height for
// alignment), and aria-labelledby can't reference an aria-hidden element.
function valuesTitleId(axis: string) {
  return `${titleId}-values-${axis}`
}
</script>

<template>
  <!-- Each top-level block below is its own flex item in the parent's
       .dropdowns row (see IndicatorVizChart.vue), so selects/radios/values
       share the available width evenly instead of the values list wrapping
       under the radios when its labels are long. -->
  <div v-if="axisNames.length > 0" class="axis-mode-block">
    <p :id="titleId" class="axis-filters-title">Afficher le graphe</p>
    <DsfrRadioButtonSet
      v-if="summable"
      v-model="mode"
      name="axis-display-mode"
      :title-id="titleId"
      small
      :options="modeOptions"
    />
  </div>

  <!-- Wrapped in the same DsfrCheckboxSet fieldset the radios get from
       DsfrRadioButtonSet, so both lists share the exact same DSFR row
       spacing instead of us re-deriving it. The visible title is repeated
       here invisibly (visibility:hidden, aria-hidden) purely to reserve the
       same header height, so the first value lines up with the first radio;
       a separate fr-sr-only span (not aria-hidden, so it's a valid
       aria-labelledby target) gives the fieldset its actual accessible name. -->
  <div v-if="summable && activeAxis" class="axis-values-block">
    <p class="axis-filters-title axis-filters-title--spacer" aria-hidden="true">
      Afficher le graphe
    </p>
    <span :id="valuesTitleId(activeAxis)" class="fr-sr-only"
      >Valeurs de l'axe "{{ activeAxis }}"</span
    >
    <DsfrCheckboxSet :title-id="valuesTitleId(activeAxis)">
      <DsfrCheckbox
        v-for="item in activeAxisValues"
        :key="item.value"
        :name="`axis-${activeAxis}`"
        :value="item.value"
        :model-value="filters[activeAxis] ?? []"
        small
        @update:model-value="(v: string[]) => setAxisValues(activeAxis!, v)"
      >
        <template #label>
          <span
            class="axis-value-swatch"
            :style="{ backgroundColor: item.color }"
          />
          <span class="axis-value-text">{{ item.value }}</span>
        </template>
      </DsfrCheckbox>
    </DsfrCheckboxSet>
  </div>

  <!-- Not summable: every combination of axis values is its own series, so
       no single color maps to one axis value. Plain checkboxes only. -->
  <template v-if="!summable">
    <div v-for="axis in axisNames" :key="axis" class="axis-values-block">
      <p
        class="axis-filters-title axis-filters-title--spacer"
        aria-hidden="true"
      >
        Afficher le graphe
      </p>
      <span :id="valuesTitleId(axis)" class="fr-sr-only"
        >Valeurs de l'axe "{{ axis }}"</span
      >
      <DsfrCheckboxSet :title-id="valuesTitleId(axis)">
        <DsfrCheckbox
          v-for="value in availableAxisValues[axis]"
          :key="value"
          :name="`axis-${axis}`"
          :value="value"
          :label="value"
          :model-value="filters[axis] ?? []"
          small
          @update:model-value="(v: string[]) => setAxisValues(axis, v)"
        />
      </DsfrCheckboxSet>
    </div>
  </template>
</template>

<style scoped>
.axis-mode-block,
.axis-values-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.axis-filters-title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: var(--text-label-grey);
  margin: 0;
}

.axis-filters-title--spacer {
  visibility: hidden;
}

/* DSFR's own label rule uses align-items:center, right for a single-line
   label but it pushes the swatch to the vertical middle of a wrapped
   multi-line one. Matching DSFR's own selector shape here (rather than just
   ".fr-label") makes ours the more specific of the two, so no !important
   is needed to win. */
.axis-values-block :deep(.fr-checkbox-group input[type='checkbox'] + label) {
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
