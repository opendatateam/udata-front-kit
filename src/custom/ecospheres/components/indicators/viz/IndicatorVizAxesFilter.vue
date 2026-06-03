<script setup lang="ts">
defineProps<{
  availableAxisValues: Record<string, string[]>
  summable: boolean
}>()

const filters = defineModel<Record<string, string[]>>('filters', {
  required: true
})
const grouped = defineModel<Record<string, boolean>>('grouped', {
  required: true
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
  <div v-if="Object.keys(availableAxisValues).length > 0" class="axis-filters">
    <div
      v-for="(values, axis) in availableAxisValues"
      :key="axis"
      class="axis-column"
    >
      <details>
        <summary>Valeurs de l'axe "{{ axis }}"</summary>
        <fieldset class="fr-fieldset">
          <div
            v-for="value in values"
            :key="value"
            class="fr-fieldset__element"
          >
            <div class="fr-checkbox-group fr-checkbox-group--sm">
              <input
                :id="`axis-${axis}-${value}`"
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
              <label class="fr-label" :for="`axis-${axis}-${value}`">{{
                value
              }}</label>
            </div>
          </div>
        </fieldset>
      </details>
      <div v-if="summable" class="fr-toggle">
        <input
          :id="`group-axis-${axis}`"
          type="checkbox"
          :checked="grouped[axis] ?? true"
          class="fr-toggle__input"
          @change="
            grouped = {
              ...grouped,
              [axis]: ($event.target as HTMLInputElement).checked
            }
          "
        />
        <label class="fr-toggle__label" :for="`group-axis-${axis}`"
          >Regrouper</label
        >
      </div>
    </div>
  </div>
</template>
