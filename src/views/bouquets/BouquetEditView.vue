<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDatasetStore } from '@/store/DatasetStore'
import { useTopicStore } from '@/store/TopicStore'
import SearchAPI from '../../services/api/SearchAPI'
import { useRouter, useRoute } from 'vue-router'
import Tooltip from '@/components/Tooltip.vue'
import { getSubThemes } from '@/utils'
import Multiselect from '@vueform/multiselect'
import config from '@/config'

const searchAPI = new SearchAPI()
const datasetStore = useDatasetStore()
const topicStore = useTopicStore()
const router = useRouter()
const route = useRoute()

const isCreate = route.name === 'bouquet_add'

const form = ref({})
const datasets = ref([])
const selectedDataset = ref({})
const selector = ref(null)
const isEditDesc = ref(false)
const loadedBouquet = ref({})
const isModalOpen = ref(false)
const isFormValidated = ref(false)
const errorMessage = ref()
const steps = [
  'Description du bouquet de données',
  'Informations du bouquet de données',
  'Composition du bouquet',
  'Récapitulatif'
]

const selectedTheme = ref(config.themes.selectedThemeDefault);
const selectedSubTheme = ref(config.themes.selectedSubThemeDefault)
const currentStep = ref(1)

const subThemes = computed(() => {
  return getSubThemes(selectedTheme.value)
})

const getOptionDefault = (theme) => {
  if (config.themes.default_options.hasOwnProperty(theme)) {
    return config.themes.default_options[theme]
  }

  return null
}

const onThemeChanged = () => {
  selectedSubTheme.value = getOptionDefault(selectedTheme.value);
}

const validateAndMoveToStep = (newStep) => {
  if (!form.value.name || !form.value.description) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    currentStep.value = newStep
  }
}

const modalActions = [
  {
    label: 'Valider',
    onClick: (event) => {
      event.preventDefault()
      onSubmitModal()
      isModalOpen.value = false
    }
  },
  {
    label: 'Annuler',
    secondary: true,
    onClick: (event) => {
      event.preventDefault()
      isModalOpen.value = false
      selectedDataset.value = {}
    }
  }
]

const search = async (query) => {
  if (!query) return []
  const results = await searchAPI._search(query, { page_size: 10 })
  return results.data.map(r => {
    return { value: r.id, label: r.title }
  }).filter(r => !datasets.value.map(d => d.dataset.id).includes(r.value))
}

const onSubmitModal = async () => {
  if (!selectedDataset.value.id) return
  if (isEditDesc.value) {
    const idx = datasets.value.findIndex(d => d.dataset.id === selectedDataset.value.id)
    datasets.value[idx].description = selectedDataset.value.description
  } else {
    const dataset = await datasetStore.load(selectedDataset.value.id)
    if (dataset) {
      datasets.value.push({ dataset, description: selectedDataset.value.description })
    }
  }
  selectedDataset.value = {}
  isEditDesc.value = false
}

const onDeleteDataset = (datasetId) => {
  datasets.value = datasets.value.filter(d => d.dataset.id !== datasetId)
  delete loadedBouquet.value.extras[`${config.universe_name}:${datasetId}:description`]
}

const onEditDataset = (dataset) => {
  isModalOpen.value = true
  isEditDesc.value = true
  selectedDataset.value.id = dataset.id
  selectedDataset.value.title = dataset.title
  selectedDataset.value.description = datasets.value.find(d => d.dataset.id === dataset.id).description
}

const extrasFromDatasets = () => {
    const extras = {}
    for (const dataset of datasets.value) {
      extras[`${config.universe_name}:${dataset.dataset.id}:description`] = dataset.description
    }
    return extras
  }

const onSubmit = async () => {
  let res
  const data = {
    ...form.value
  }

  const extras = {
    [`${config.universe.name}:informations`]: [{
      theme: selectedTheme.value,
      subtheme: selectedSubTheme.value
    }]
  }

  if (isCreate) {
    res = await topicStore.create({
      ...data,
      tags: [config.universe.name],
      extras: { ...extras, ...extrasFromDatasets() }
    })
  } else {
    res = await topicStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
      extras: { ...loadedBouquet.value.extras, ...extras, ...extrasFromDatasets()}
    })
  }

  if (res.status && res.status === 400) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    setTimeout(() => {
      router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
    }, 1000)
  }
}

const loadDatasets = async (datasetIds, bouquet) => {
    for (const datasetId of datasetIds) {
      const dataset = await datasetStore.load(datasetId)
      datasets.value.push({
        dataset,
        description: bouquet.extras[`${config.universe_name}:${dataset.id}:description`] || "",
      })
    }
  }

onMounted(() => {
  if (!isCreate) {
    topicStore.load(route.params.bid).then((data) => {
      loadedBouquet.value = data
      form.value.name = data.name
      form.value.description = data.description,
      loadDatasets(data.datasets.map(d => d.id), data)
    })
  }
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <DsfrStepper :steps="steps" :current-step="currentStep" />
      </div>
    </div>
    <form @submit.prevent="onSubmit()">
    
      <div v-show="currentStep === 1">
        <div class="fr-grid-row">
          <div class="fr-col-12 fr-col-lg-7">
            <div>
              <div class="fr-mt-4v">
                <DsfrAlert
                  v-if="isFormValidated && !errorMessage"
                  type="success"
                  title="Bouquet créé"
                  description="Votre bouquet a bien été créé."
                />
                <DsfrAlert v-if="errorMessage" type="warning" :title="errorMessage" />
              </div>

                <DsfrInput
                  v-model="form.name"
                  class="fr-mt-1w fr-mb-4w"
                  type="text"
                  placeholder="Mon bouquet"
                  :label-visible="true"
                  label="Sujet du bouquet"
                />

                <Tooltip
                  title="Objectif du bouquet"
                  name="tooltip__objectif"
                  text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
                />
                <Tooltip
                  title="Utilisez du markdown pour mettre en forme votre texte"
                  name="tooltip__markdown"
                  text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
                />
                <DsfrInput
                  v-model="form.description"
                  class="fr-mt-1w"
                  placeholder="Ma description"
                  :label-visible="true"
                  :is-textarea="true"
                />
            </div>
          </div>
        </div>
        <DsfrButton type="button" class="fr-mt-2w" label="Suivant" @click.prevent="validateAndMoveToStep(2)" />
      </div>
    
      <div v-show="currentStep === 2">
        <div class="fr-grid-row">
            <div class="fr-col-12 fr-col-lg-8">
              <div>
                <div class="fr-grid-row justify-between">
                  <div class="fr-col-12 fr-col-sm-45">
                    <DsfrSelect
                      v-model="selectedTheme"
                      label="Thématique"
                      :options="config.themes.thematiques"
                      :model-value="selectedTheme"
                      @change="onThemeChanged"
                    />
                  </div>
                  <div class="fr-col-12 fr-col-sm-45">
                    <DsfrSelect
                      v-model="selectedSubTheme"
                      label="Chantier"
                      :options="subThemes"
                      :model-value="selectedSubTheme"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TODO: REMOVE SEEARCH AFTER TEST -->
          <DsfrButton label="Ajouter un jeu de données"
            @click.stop.prevent="isModalOpen = true"
            ref="modalOrigin" :secondary="true" />
          <DsfrModal
            ref="modal"
            :opened="isModalOpen"
            title="Ajouter un jeu de données"
            @close="isModalOpen = false"
            :origin="$refs.modalOrigin"
            :actions="modalActions"
          >
            <label for="select-datasets">Sélectionnez un jeu de données</label>
            <Multiselect
              noOptionsText="Précisez ou élargissez votre recherche"
              ref="selector"
              class="fr-mt-1w fr-mb-2w"
              placeholder="Cherchez un jeu de données"
              name="select-datasets"
              v-model="selectedDataset.id"
              :filter-results="false"
              :min-chars="1"
              :resolve-on-load="false"
              :delay="0"
              :searchable="true"
              :options="search"
              v-if="!isEditDesc"
            />
            <DsfrInput v-else
              class="fr-mt-1w fr-mb-2w"
              :disabled="true"
              v-model="selectedDataset.title"
            />
            <DsfrInput
              class="fr-mt-1w fr-mb-2w"
              v-model="selectedDataset.description"
              label="Description du jeu de données dans le bouquet"
              placeholder="Pourquoi avez-vous ajouté ce jeu de données ?"
              :label-visible="true"
              :is-textarea="true"
            />
          </DsfrModal>
          <div class="fr-table">
            <table v-if="datasets.length">
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Organisation</th>
                  <th scope="col">Description</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in datasets">
                  <td>{{ d.dataset.title }}</td>
                  <td>{{ d.dataset.organization?.name }}</td>
                  <td>{{ d.description }}</td>
                  <td>
                    <div class="es__button-container">
                      <DsfrButton
                        :icon-only="true" icon="ri-delete-bin-line" size="sm"
                        title="Supprimer"
                        @click.stop.prevent="onDeleteDataset(d.dataset.id)"
                      />
                      <DsfrButton
                        :icon-only="true" icon="ri-pencil-line" size="sm"
                        title="Editer"
                        @click.stop.prevent="onEditDataset(d.dataset)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- END -->
          <DsfrButton type="submit" class="fr-mt-2w" label="Suivant" />
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.es__button-container {
  display: flex;
  button:first-child {
    margin-right: 0.5em;
  }
}
.required {
  color: red;
}

.fr-col-sm-45 {
  flex: 0 0 45%;
  max-width: 45%;
  width: 45%;
}

.justify-between {
  justify-content: space-between;
}

:deep .tooltip {
  &__objectif,
  &__markdown {
    display: block;
  }

  &__objectif {
    left: 2.5rem;
  }

  &__markdown {
    left: 46%;
  }
}
</style>