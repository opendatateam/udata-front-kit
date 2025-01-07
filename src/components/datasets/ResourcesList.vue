<script setup lang="ts">
import config from '@/config'
import { type ResourceDataWithQuery } from '@/model/resource'
import { useResourceStore } from '@/store/ResourceStore'
import { Pagination, ResourceAccordion } from '@datagouv/components'
import { toRef } from 'vue'

const pageSize = config.website.pagination_sizes.files_list as number

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  },
  resources: {
    type: Object as () => Record<string, ResourceDataWithQuery>,
    required: true
  }
})

const localResources = toRef(props, 'resources')
const resourceStore = useResourceStore()

const getResourcesTitle = (typedResources: ResourceDataWithQuery) => {
  if (typedResources?.total > 1) {
    let pluralName
    switch (typedResources.type.id) {
      case 'main':
        pluralName = 'Fichiers principaux'
        break
      case 'documentation':
        pluralName = 'Documentations'
        break
      case 'update':
        pluralName = 'Mises à jour'
        break
      case 'api':
        pluralName = 'APIs'
        break
      case 'code':
        pluralName = 'Dépôts de code'
        break
      case 'other':
        pluralName = 'Autres'
        break
      default:
        pluralName = typedResources.type.label
    }
    return `${typedResources.total} ${pluralName}`
  } else {
    return typedResources.type.label
  }
}

const updateQuery = (q: string, typeId: string) => {
  localResources.value[typeId].query = q
  changePage(typeId, 1, q)
}

const doSearch = (typeId: string) => {
  changePage(typeId, 1, localResources.value[typeId].query)
}

const changePage = (type: string, page = 1, query = '') => {
  localResources.value[type].currentPage = page
  localResources.value[type].query = query
  return resourceStore
    .fetchDatasetResources(props.datasetId, type, page, query)
    .then((data) => {
      localResources.value[type].resources = data.data
      localResources.value[type].total = data.total
    })
}
</script>

<template>
  <template v-for="typedResources in localResources">
    <div
      v-if="typedResources.totalWithoutFilter"
      :key="typedResources.type.id"
      class="fr-mb-4w"
    >
      <h2 class="fr-mb-1v subtitle subtitle--uppercase">
        {{ getResourcesTitle(typedResources) }}
      </h2>
      <DsfrSearchBar
        v-if="typedResources.totalWithoutFilter > pageSize"
        label="Rechercher un fichier"
        button-text="Rechercher"
        placeholder=""
        :large="false"
        class="search-bar"
        @search="() => doSearch(typedResources.type.id)"
        @update:model-value="
          (value: string) => updateQuery(value, typedResources.type.id)
        "
      />
      <span v-if="typedResources.resources.length != 0">
        <ResourceAccordion
          v-for="resource in typedResources.resources"
          :key="resource.id"
          :dataset-id="datasetId"
          :resource="resource"
        />
        <Pagination
          v-if="typedResources.total > pageSize"
          class="fr-mt-3w"
          :page="typedResources.currentPage"
          :page-size="pageSize"
          :total-results="typedResources.total"
          @change="
            (page) =>
              changePage(typedResources.type.id, page, typedResources.query)
          "
        />
      </span>
      <span v-else> <br />Aucun résultat pour votre recherche. </span>
    </div>
  </template>
</template>
