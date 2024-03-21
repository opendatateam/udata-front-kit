<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import { computed, onMounted, watch } from 'vue'

import { ConfigUtils } from '@/config'
import { NoOptionSelected, type SelectOption, type Theme } from '@/model'
import type {
  SpatialCoverage,
  SpatialCoverageLevel,
  SpatialField
} from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useSpatialStore } from '@/store/SpatialStore'
import { useSpatialCoverageFromField } from '@/utils/spatial'

const props = defineProps({
  theme: {
    type: String,
    default: NoOptionSelected
  },
  subtheme: {
    type: String,
    default: NoOptionSelected
  },
  spatialField: {
    type: Object as () => SpatialField,
    default: () => ({})
  }
})

const emit = defineEmits([
  'updateValidation',
  'update:theme',
  'update:subtheme',
  'update:spatialField'
])

const spatialCoverage = useSpatialCoverageFromField(props.spatialField)

const isValid = computed(() => {
  return props.theme !== NoOptionSelected && props.subtheme !== NoOptionSelected
})

const selectedTheme = computed((): Theme | null => {
  return ConfigUtils.getThemeByName(props.theme)
})

const themeOptions = computed((): SelectOption[] => {
  return ConfigUtils.getThemeOptions()
})

const subthemeOptions = computed((): SelectOption[] => {
  return selectedTheme.value
    ? ConfigUtils.getSubthemeOptions(selectedTheme.value)
    : []
})

const getLevelById = (levelId: string): SpatialCoverageLevel | undefined => {
  return useSpatialStore().getLevelById(levelId)
}

const switchTheme = (event: Event) => {
  emit('update:theme', (event.target as HTMLSelectElement).value)
  emit('update:subtheme', NoOptionSelected)
}

const switchSubtheme = (event: Event) => {
  emit('update:subtheme', (event.target as HTMLSelectElement).value)
}

const onSelectSpatialCoverage = (value: SpatialCoverage) => {
  emit('update:spatialField', {
    ...props.spatialField,
    zones: [value.id]
  } as SpatialField)
}

const onClearSpatialCoverage = () => {
  emit('update:spatialField', { ...props.spatialField, zones: null })
}

const spatialCoverageOptions = async (query: string) => {
  if (!query) return []
  return await new SpatialAPI().suggestZones(query, {
    page_size: 10
  })
}

watch(
  isValid,
  (newValue) => {
    emit('updateValidation', newValue)
  },
  { immediate: true }
)

onMounted(() => {
  useSpatialStore().loadLevels()
})
</script>

<template>
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme"
      >Thématique <span class="required">&nbsp;*</span></label
    >
    <select id="select_theme" class="fr-select" @change="switchTheme($event)">
      <option :value="NoOptionSelected" :selected="theme == NoOptionSelected">
        Choisir une thématique
      </option>
      <option
        v-for="option in themeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === theme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>

  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_subtheme"
      >Chantier <span class="required">&nbsp;*</span></label
    >
    <select
      id="select_subtheme"
      class="fr-select"
      :disabled="theme === NoOptionSelected"
      @change="switchSubtheme($event)"
    >
      <option
        :value="NoOptionSelected"
        :selected="subtheme == NoOptionSelected"
      >
        Choisir un chantier
      </option>
      <option
        v-for="option in subthemeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === subtheme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>

  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select-spatial-coverage"
      >Couverture territoriale</label
    >
    <Multiselect
      id="link"
      ref="selector"
      v-model="spatialCoverage"
      value-prop="id"
      no-options-text="Précisez ou élargissez votre recherche"
      placeholder="Rechercher une couverture territoriale"
      name="select-spatial-coverage"
      autocomplete="off"
      class="multiselect-spatial-coverage"
      :clear-on-select="true"
      :filter-results="false"
      :min-chars="1"
      :resolve-on-load="false"
      :delay="400"
      :searchable="true"
      :options="spatialCoverageOptions"
      :object="true"
      @select="onSelectSpatialCoverage"
      @clear="onClearSpatialCoverage"
    >
      <template #singlelabel="{ value }">
        <div class="multiselect-single-label">
          {{ getLevelById((value as SpatialCoverage).level)?.name }} :
          {{ (value as SpatialCoverage).name }} ({{
            (value as SpatialCoverage).code
          }})
        </div>
      </template>

      <template #option="{ option }">
        <div class="header">
          <span class="name">{{ (option as SpatialCoverage).name }}</span>
          <span class="code fr-ml-1v">{{
            (option as SpatialCoverage).code
          }}</span>
        </div>
        <div class="level">
          {{ getLevelById((option as SpatialCoverage).level)?.name }}
        </div>
      </template>
    </Multiselect>
  </div>
</template>

<style lang="scss">
// /!\ style won't apply to .multiselect-option if style=scoped
// so we're scoping manually with a parent class
.multiselect-spatial-coverage {
  .multiselect-options {
    .multiselect-option {
      flex-direction: column;
      align-items: flex-start;
      .code,
      .level {
        font-size: 0.8rem;
      }
      .level {
        display: block;
      }
    }
  }
}
</style>
