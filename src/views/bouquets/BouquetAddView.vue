<script setup>
import { ref } from "vue"
import { useDatasetStore } from "../../store/DatasetStore"
import { DsfrButton } from "@gouvminint/vue-dsfr"
import { useRouter } from "vue-router"
import SearchAPI from "../../services/api/SearchAPI"
import TopicsAPI from "../../services/api/resources/TopicsAPI"
import Multiselect from "@vueform/multiselect"

const searchAPI = new SearchAPI()
const topicsAPI = new TopicsAPI()
const store = useDatasetStore()
const router = useRouter()

const form = ref({})
const datasets = ref([])
const selectedDataset = ref(null)
const selector = ref(null)

const search = async (query) => {
  if (!query) return []
  const results = await searchAPI._search(query, { hitsPerPage: 10 })
  return results.hits.map(r => {
    return { value: r.id, label: r.title }
  }).filter(r => !datasets.value.map(d => d.id).includes(r.value))
}

const onSelect = async (value) => {
  const dataset = await store.load(value)
  datasets.value.push(dataset)
  selector.value.clear()
  selector.value.refreshOptions()
}

const onDeleteDataset = (datasetId) => {
  datasets.value = datasets.value.filter(d => d.id !== datasetId)
}

const onSubmit = () => {
  topicsAPI.create({
    ...form.value,
    datasets: datasets.value.map(d => d.id),
    tags: ["ecospheres"],
    extras: { is_ecospheres: true },
  }).then(res => {
    console.log(res)
    router.push({ name: "bouquet_detail", params: { bid: res.id } })
  })
}
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <h1>Ajouter un bouquet</h1>
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
                  @click="onDeleteDataset(d.id)"
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
