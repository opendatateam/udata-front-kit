<script setup>
import { ref, onMounted } from "vue"
import { useDatasetStore } from "../../store/DatasetStore"
import { useBouquetStore } from "../../store/BouquetStore"
import { useRouter, useRoute } from "vue-router"
import SearchAPI from "../../services/api/SearchAPI"
import Multiselect from "@vueform/multiselect"

const searchAPI = new SearchAPI()
const datasetStore = useDatasetStore()
const bouquetStore = useBouquetStore()
const router = useRouter()
const route = useRoute()

const isCreate = route.name === "bouquet_add"

const form = ref({})
const datasets = ref([])
const selectedDataset = ref(null)
const selector = ref(null)
const loadedBouquet = ref({})

const search = async (query) => {
  if (!query) return []
  const results = await searchAPI._search(query, { hitsPerPage: 10 })
  return results.hits.map(r => {
    return { value: r.id, label: r.title }
  }).filter(r => !datasets.value.map(d => d.id).includes(r.value))
}

const onSelect = async (value) => {
  const dataset = await datasetStore.load(value)
  datasets.value.push(dataset)
  selector.value.clear()
  selector.value.refreshOptions()
}

const onDeleteDataset = (datasetId) => {
  datasets.value = datasets.value.filter(d => d.id !== datasetId)
}

const onSubmit = async () => {
  let res
  const data = {
    ...form.value,
    datasets: datasets.value.map(d => d.id),
  }
  if (isCreate) {
    res = await bouquetStore.create({
      ...data,
      tags: ["ecospheres"],
      extras: { is_ecospheres: true },
    })
  } else {
    res = await bouquetStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
    })
  }
  router.push({ name: "bouquet_detail", params: { bid: res.slug } })
}

const loadDatasets = async (datasetIds) => {
  for (const datasetId of datasetIds) {
    datasets.value.push(await datasetStore.load(datasetId))
  }
}

onMounted(() => {
  if (!isCreate) {
    bouquetStore.load(route.params.bid).then(data => {
      loadedBouquet.value = data
      form.value.name = data.name
      form.value.description = data.description
      loadDatasets(data.datasets.map(d => d.id))
    })
  }
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <h1 v-if="isCreate">Ajouter un bouquet</h1>
    <h1 v-else>Modifier le bouquet {{ loadedBouquet.name }}</h1>
    <form @submit.prevent="onSubmit()">
      <DsfrInput
        class="fr-mt-1w fr-mb-2w"
        v-model="form.name"
        label="Nom du bouquet"
        type="text"
        placeholder="Mon bouquet"
        :label-visible="true"
        :required="true"
      />
      <DsfrInput
        class="fr-mt-1w fr-mb-2w"
        v-model="form.description"
        label="Description du bouquet"
        placeholder="Ma description"
        :label-visible="true"
        :is-textarea="true"
        :required="true"
      />
      <label for="select-datasets">Jeux de données</label>
      <Multiselect
        noOptionsText="Précisez ou élargissez votre recherche"
        ref="selector"
        class="fr-mt-1w fr-mb-2w"
        placeholder="Cherchez un jeu de données"
        name="select-datasets"
        v-model="selectedDataset"
        :filter-results="false"
        :min-chars="1"
        :resolve-on-load="false"
        :delay="0"
        :searchable="true"
        :options="search"
        @select="onSelect"
      />
      <div class="fr-table">
        <table v-if="datasets.length">
          <thead>
            <tr>
              <th scope="col">Titre</th>
              <th scope="col">Organisation</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in datasets">
              <td>{{ d.title }}</td>
              <td>{{ d.organization?.name }}</td>
              <td>
                <DsfrButton
                  :icon-only="true" icon="ri-delete-bin-line"
                  title="Supprimer"
                  @click.stop.prevent="onDeleteDataset(d.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <DsfrButton type="submit" label="Enregistrer" />
    </form>
  </div>
</template>
