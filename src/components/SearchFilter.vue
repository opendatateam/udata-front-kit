<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
  watchEffect,
  type PropType,
  type Ref
} from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { FilterConf } from '@/model/config'
import type { SpatialCoverage } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useUserStore } from '@/store/UserStore'
import { useSearchPagesConfig } from '@/utils/config'

interface Filter {
  filter: string
  value: string
}

const spatialAPI = new SpatialAPI()

const props = defineProps({
  geozone: {
    type: String as PropType<string | null>,
    default: null
  },
  showDrafts: {
    type: Boolean,
    default: false
  },
  tags: {
    type: Array<String>,
    default: []
  }
})

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const selectedGeozone: Ref<string | undefined> = ref(undefined)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const searchPageName = ref<string>('')
const searchPageSlug = ref<string>('')
const searchPageFilters = ref<FilterConf[]>([])
const searchPageType = ref<string>('')
const searchPageGeozones = ref<boolean>(false)

const config = useSearchPagesConfig(
  route.path.replace('/admin', '').split('/')[1]
)
searchPageName.value = config.searchPageName
searchPageSlug.value = config.searchPageSlug
searchPageFilters.value = config.searchPageFilters
searchPageType.value = config.searchPageType
searchPageGeozones.value = config.searchPageGeozones

const currentFilters = ref<Record<string, string>>({})

if (searchPageFilters.value) {
  searchPageFilters.value.forEach((item) => {
    currentFilters.value[item.tag] = ''
  })
}

const localShowDrafts = ref(false)

const computeQueryArgs = (): LocationQueryRaw => {
  const query: LocationQueryRaw = {}
  if (selectedGeozone.value) query.geozone = selectedGeozone.value
  if (localShowDrafts.value) {
    query.drafts = 1
  }
  if (route.query.q) {
    query.q = route.query.q
  }
  let tags = Object.entries(currentFilters.value)
    .map(([key, value]) => value)
    .filter((value) => value != '')
    .join(',')
  if (tags) {
    query.tags = tags
  }
  return query
}

const navigate = () => {
  router.push({
    path: `/${searchPageSlug.value}`,
    query: computeQueryArgs()
  })
}

const updateCurrentFilters = (tag: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  currentFilters.value[tag] = target.value
  if (searchPageFilters.value) {
    searchPageFilters.value.forEach((spf) => {
      if (spf.condition_on && spf.condition_on == tag) {
        currentFilters.value[spf.tag] = ''
      }
    })
  }
  navigate()
}

const handleCheckboxes = (tag: string, value: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    currentFilters.value[tag] = value
    if (searchPageFilters.value) {
      searchPageFilters.value.forEach((spf) => {
        if (spf.condition_on && spf.condition_on == tag) {
          currentFilters.value[spf.tag] = ''
        }
      })
    }
  } else {
    if (tag in currentFilters.value) {
      delete currentFilters.value[tag]
    }
  }
  navigate()
}

const switchSpatialCoverage = (
  spatialCoverage: SpatialCoverage | null | undefined
) => {
  selectedGeozone.value =
    spatialCoverage != null ? spatialCoverage.id : undefined
  navigate()
}

const switchLocalShowDrafts = () => {
  navigate()
}

watchEffect(() => {
  if (props.geozone) {
    selectedGeozone.value = props.geozone
    spatialAPI
      .getZone(props.geozone)
      .then((zone) => (selectedSpatialCoverage.value = zone))
  } else {
    selectedSpatialCoverage.value = undefined
    selectedGeozone.value = undefined
  }
  localShowDrafts.value = props.showDrafts
})

watch(
  () => route.path,
  () => {
    const config = useSearchPagesConfig(
      route.path.replace('/admin', '').split('/')[1]
    )
    if (config) {
      searchPageName.value = config.searchPageName
      searchPageSlug.value = config.searchPageSlug
      searchPageFilters.value = config.searchPageFilters
      searchPageType.value = config.searchPageType
      searchPageGeozones.value = config.searchPageGeozones
      if (searchPageFilters.value) {
        searchPageFilters.value.forEach((item) => {
          currentFilters.value[item.tag] = ''
        })
      }
    }
  }
)

const filteredSearchPageFilters = computed(() => {
  if (!searchPageFilters.value) return
  return searchPageFilters.value.map((spf) => ({
    ...spf,
    values:
      spf.condition_on && spf.condition_on in currentFilters.value
        ? spf.values.filter(
            (option) =>
              currentFilters.value[spf.condition_on] === option.condition_on
          )
        : spf.values
  }))
})

onMounted(() => {
  searchPageFilters.value.forEach((spf) => {
    spf.values.forEach((val) => {
      if (props.tags.includes(val.tag)) {
        if (!spf.filter_multiple) {
          currentFilters.value[spf.tag] = val.tag
        } else {
          currentFilters.value[`checkboxes-${val.tag}`] = val.tag
        }
      }
    })
  })
})
</script>

<template>
  <div className="filterForm">
    <DsfrCheckbox
      v-if="userStore.isLoggedIn && searchPageType == 'topics'"
      v-model="localShowDrafts"
      label="Afficher les brouillons"
      name="show_drafts"
      @update:model-value="switchLocalShowDrafts"
    />
    <div v-bind:key="filter.name" v-for="filter in filteredSearchPageFilters">
      <div v-if="!filter.filter_multiple" class="fr-select-group">
        <label class="fr-label" :for="`select_${filter.tag}`">
          {{ filter.name }}
        </label>
        <select
          :id="`select_${filter.tag}`"
          class="fr-select"
          @change="updateCurrentFilters(filter.tag, $event)"
        >
          <option v-if="filter.label_for_all" value="">
            {{ filter.label_for_all }}
          </option>
          <option
            v-for="option in filter.values"
            :key="option.tag"
            :value="option.tag"
            :selected="currentFilters[filter.tag] === option.tag ? true : false"
          >
            {{ option.name }}
          </option>
        </select>
      </div>
      <div v-else>
        <div class="fr-fieldset__element">
          <div class="fr-checkbox-label">
            <label class="fr-label" :for="`select_${filter.tag}`">
              {{ filter.name }}
            </label>
          </div>
          <div
            v-for="option in filter.values"
            :key="option.tag"
            :value="option.tag"
            class="fr-checkbox-group"
          >
            <input
              :name="`checkboxes-${option.tag}`"
              :id="`checkboxes-${option.tag}`"
              type="checkbox"
              :checked="
                currentFilters[`checkboxes-${option.tag}`] === option.tag
                  ? true
                  : false
              "
              :aria-describedby="`checkboxes--${option.tag}-messages`"
              @change="
                handleCheckboxes(`checkboxes-${option.tag}`, option.tag, $event)
              "
            />
            <label class="fr-label" :for="`checkboxes-${option.tag}`">
              {{ option.name }}
            </label>
          </div>
        </div>
        <div
          class="fr-messages-group"
          id="checkboxes-messages"
          aria-live="assertive"
        ></div>
      </div>
    </div>
    <div class="fr-select-group" v-if="searchPageGeozones">
      <label class="fr-label" for="select-spatial-coverage"
        >Couverture territoriale</label
      >
      <SelectSpatialCoverage
        v-model:spatial-coverage-model="selectedSpatialCoverage"
        :short="true"
        @update:spatial-coverage-model="switchSpatialCoverage"
      />
    </div>
  </div>
</template>

<style scoped>
.fr-select-group {
  margin-bottom: 20px;
}
.fr-checkbox-group {
  margin-bottom: 10px;
}
.fr-checkbox-label {
  margin-bottom: 10px;
}
</style>
