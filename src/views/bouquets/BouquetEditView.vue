<script setup>
import Multiselect from '@vueform/multiselect'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import Tooltip from '@/components/Tooltip.vue'
import config from '@/config'
import SearchAPI from '@/services/api/SearchAPI'
import { useDatasetStore } from '@/store/DatasetStore'
import { useTopicStore } from '@/store/TopicStore'
import { descriptionFromMarkdown } from '@/utils'

const searchAPI = new SearchAPI()
const datasetStore = useDatasetStore()
const topicStore = useTopicStore()
const router = useRouter()
const route = useRoute()

const isCreate = route.name === 'bouquet_add'
const datasetsPropertiesKey = `${config.universe.name}:datasets_properties`

const form = ref({})
const datasets = ref([])
const selectedDataset = ref({})
const selector = ref(null)
const loadedBouquet = ref({})
const datasetsProperties = ref({
  [datasetsPropertiesKey]: []})
const isEditDesc = ref(false)
const errorMessage = ref()
const selectedTheme = ref(null)
const selectedSubTheme = ref(null)
const currentStep = ref(1)
const libelle = ref()
const raison = ref()
const urlData = ref()
const steps = [
  'Description du bouquet de données',
  'Informations du bouquet de données',
  'Composition du bouquet de données',
  'Récapitulatif'
]

const themes = computed(() => config.themes)

const subThemes = computed(() => {
  const theme = themes.value.find((t) => t.name === selectedTheme.value)
  return theme ? theme.subthemes : []
})

const themeOptions = computed(() => {
  return themes.value.map((theme) => ({
    text: theme.name
  }))
})

const subThemeOptions = computed(() => {
  return subThemes.value.map((subTheme) => ({
    text: subTheme.name
  }))
})

const DataPropertiesLength = computed(() => {
  return datasetsProperties.value[datasetsPropertiesKey]
    .length
})

const description = computed(() => descriptionFromMarkdown(form))

const onThemeChanged = () => {
  selectedSubTheme.value = null
}

const search = async (query) => {
  if (!query) return []
  const results = await searchAPI._search(query, config.universe.topic_id, 1, {
    page_size: 10
  })
  return results.data
    .map((r) => {
      return { value: r.id, label: r.title, uri: r.uri }
    })
    .filter((r) => !datasets.value.map((d) => d.dataset.id).includes(r.value))
}

const extrasFromDatasets = () => {
  const extras = {}
  for (const dataset of datasets.value) {
    extras[`${config.universe.name}:${dataset.dataset.id}:description`] =
      dataset.description
  }
  return extras
}

let nextId = 0
const addDatasetsPropertiesToExtras = async () => {
  const setUri = urlData.value ? urlData.value : null

  if (libelle.value && raison.value) {
    if (selectedDataset.value.id) {
      const dataset = await datasetStore.load(selectedDataset.value.id)

      if (dataset) {
        datasets.value.push({
          dataset,
          description: selectedDataset.value.description
        })

        const getUrl = datasets.value.reduce(
          (acc, url) => acc + url.dataset.page,
          ''
        )

        datasetsProperties.value[datasetsPropertiesKey].push({
          libelle: libelle.value,
          raison: raison.value,
          uri: getUrl,
          id: selectedDataset.value.id
        })
      }
    } else {
      datasetsProperties.value[datasetsPropertiesKey].push(
        {
          libelle: libelle.value,
          raison: raison.value,
          uri: setUri,
          id: `__internal__${nextId++}`
        }
      )
    }
  }

  libelle.value = ''
  raison.value = ''
  urlData.value = ''
  datasets.value = []
  selectedDataset.value = {}
  isEditDesc.value = false
}

const onDeleteDataset = (datasetId) => {
  if (
    datasetsProperties.value &&
    datasetsProperties.value[datasetsPropertiesKey]
  ) {
    datasetsProperties.value[datasetsPropertiesKey] = datasetsProperties.value[datasetsPropertiesKey].filter((d) => d.id !== datasetId)
  }

  if (loadedBouquet.value && loadedBouquet.value.extras) {
    delete loadedBouquet.value.extras[datasetsPropertiesKey];
  }
}

const validateAndMoveToStep = (newStep) => {
  if (!form.value.name || !form.value.description) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    currentStep.value = newStep
  }
}

const onSubmit = async () => {
  const data = {
    ...form.value
  }
  const informationsInExtras = {
    [`${config.universe.name}:informations`]: [
      {
        theme: selectedTheme.value,
        subtheme: selectedSubTheme.value
      }
    ]
  }

  let res

  if (isCreate) {
    res = await topicStore.create({
      ...data,
      tags: [config.universe.name],
      extras: {
        ...informationsInExtras,
        ...datasetsProperties.value,
        ...extrasFromDatasets
      }
    })
  } else {
    res = await topicStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
      extras: {
        ...loadedBouquet.value.extras,
        ...informationsInExtras,
        ...datasetsProperties.value,
        ...extrasFromDatasets()
      }
    })
  }

  if (res.status && res.status === 400) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
  }
}

const loadDatasets = async (datasetIds, bouquet) => {
  for (const datasetId of datasetIds) {
    const dataset = await datasetStore.load(datasetId)
    datasets.value.push({
      dataset,
      description:
        bouquet.extras[`${config.universe.name}:${dataset.id}:description`] ||
        ''
    })
  }
}

onMounted(() => {
  if (!isCreate) {
    topicStore.load(route.params.bid).then((data) => {
      const datasetsProperties = data.extras[
        datasetsPropertiesKey
      ].map((datasetProperties) => {
        return {
          id: datasetProperties.id,
          libelle: datasetProperties.libelle,
          raison: datasetProperties.raison,
          uri: datasetProperties.uri
        }
      })
      loadedBouquet.value = data
      form.value.name = data.name
      form.value.description = data.description
      selectedTheme.value =
        data.extras[`${config.universe.name}:informations`][0].theme
      selectedSubTheme.value =
        data.extras[`${config.universe.name}:informations`][0].subtheme
      datasetsProperties.value[datasetsPropertiesKey] =
        datasetsProperties
      loadDatasets(
        data.datasets.map((d) => d.id),
        data
      )
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
                  v-if="errorMessage"
                  type="warning"
                  :title="errorMessage"
                />
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
        <DsfrButton
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!form.name || !form.description"
          @click.prevent="validateAndMoveToStep(2)"
        />
      </div>

      <div v-show="currentStep === 2">
        <div class="fr-grid-row">
          <div class="fr-col-12 fr-col-lg-8">
            <div class="fr-grid-row justify-between">
              <div class="fr-col-12 fr-col-sm-45">
                <DsfrSelect
                  v-model="selectedTheme"
                  default-unselected-text="Sélectionnez une thématique"
                  label="Thématique"
                  :options="themeOptions"
                  @update:model-value="onThemeChanged"
                />
              </div>
              <div class="fr-col-12 fr-col-sm-45">
                <DsfrSelect
                  v-model="selectedSubTheme"
                  :disabled="!selectedTheme"
                  default-unselected-text="Sélectionnez un chantier"
                  label="Chantier"
                  :options="subThemeOptions"
                />
              </div>
            </div>
          </div>
        </div>
        <DsfrButton
          type="button"
          class="fr-mt-2w fr-mr-2w"
          label="Précédent"
          @click.prevent="validateAndMoveToStep(1)"
        />
        <DsfrButton
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!selectedSubTheme"
          @click.prevent="validateAndMoveToStep(3)"
        />
      </div>

      <div v-show="currentStep === 3">
        <div class="fr-grid-row fr-mb-5w">
          <div class="fr-col-12 fr-col-lg-7">
            <DsfrInput
              v-model="libelle"
              class="fr-mb-3w"
              label="Libellé de la donnée"
              :label-visible="true"
            />
            <DsfrInput
              v-model="raison"
              class="fr-mb-3w"
              label="Raison d'utilisation dans ce bouquet*"
              hint="Indiquer l'utilité de la donnée pour ce bouquet"
              :label-visible="true"
              :is-textarea="true"
            />
          </div>
        </div>
        <hr />
        <div class="fr-grid-row align-center fr-mt-3w">
          <div class="fr-col-12 fr-col-lg-5">
            <Multiselect
              ref="selector"
              v-model="selectedDataset.id"
              no-options-text="Précisez ou élargissez votre recherche"
              placeholder="Rechercher une donnée dans Ecosphères"
              name="select-datasets"
              :clear-on-select="true"
              :filter-results="false"
              :min-chars="1"
              :resolve-on-load="false"
              :delay="0"
              :searchable="true"
              :options="search"
            />
          </div>
        </div>

        <h3 class="fr-mb-2w fr-mt-3w">
          Vous ne trouvez pas la donnée dans Écosphères ?
        </h3>
        <div class="fr-grid-row align-baseline fr-mb-4w">
          <div class="fr-col-12 fr-col-lg-5">
            <DsfrInput
              v-model="urlData"
              placeholder="Url vers le jeu de données souhaité"
              :label-visible="true"
              class="fr-mb-md-1w"
            />
          </div>
          <div class="fr-col-12 fr-col-lg-4 fr-ml-md-10w fr-mt-5w fr-m-lg-0">
            <DsfrButton
              label="Ajouter la donnée"
              :secondary="true"
              @click.prevent="addDatasetsPropertiesToExtras()"
            />
          </div>
        </div>
        <hr />

        <h3>
          Données sélectionnées
          <span v-if="DataPropertiesLength"
            >({{ DataPropertiesLength }})</span
          >
        </h3>
        <div v-if="!DataPropertiesLength" class="no-dataset fr-py-2 fr-px-3w">
          <p class="fr-m-0">Aucune donnée ajoutée</p>
        </div>
        <div v-else>
          <DsfrAccordionsGroup>
            <li v-for="datasetProperties in datasetsProperties[datasetsPropertiesKey]">
              <DsfrAccordion
                :title="datasetProperties.libelle"
                :expanded-id="datasetProperties.id"
                @expand="datasetProperties.id = $event"
              >
                <div>
                  {{ datasetProperties.raison }}
                </div>
                <div class="button__wrapper">
                  <DsfrButton
                    icon="ri-delete-bin-line"
                    label="Retirer de la section"
                    class="fr-mr-2w"
                    @click.stop.prevent="onDeleteDataset(datasetProperties.id)"
                  />
                  <a
                    v-if="datasetProperties.uri"
                    class="fr-btn fr-btn--secondary inline-flex"
                    :href="datasetProperties.uri"
                    target="_blank"
                    >Voir le catalogue source</a
                  >
                </div>
              </DsfrAccordion>
            </li>
          </DsfrAccordionsGroup>
        </div>
        <DsfrButton
          type="button"
          class="fr-mt-2w fr-mr-2w"
          label="Précédent"
          @click.prevent="validateAndMoveToStep(2)"
        />
        <DsfrButton
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!DataPropertiesLength"
          @click.prevent="validateAndMoveToStep(4)"
        />
      </div>

      <div v-show="currentStep === 4">
        <h4>
          Description du bouquet de données
          <DsfrButton
            :icon-only="true"
            size="sm"
            icon="ri-pencil-line"
            title="Editer Étape 1"
            :tertiary="true"
            :no-outline="true"
            @click.prevent="validateAndMoveToStep(1)"
          />
        </h4>

        <p class="fr-mb-0"><strong>Sujet du bouquet</strong></p>
        <p v-html="form.name" />
        <p class="fr-mb-0"><strong>Objectif du bouquet</strong></p>
        <p class="markdown__description" v-html="description" />
        <hr />

        <h4>Information du bouquet de données
          <DsfrButton
            :icon-only="true"
            size="sm"
            icon="ri-pencil-line"
            title="Editer Étape 2"
            :tertiary="true"
            :no-outline="true"
            @click.prevent="validateAndMoveToStep(2)"
          />
        </h4>
        <p class="fr-mb-0"><strong>Thématique</strong></p>
        <p v-html="selectedTheme" />
        <p class="fr-mb-0"><strong>Chantier</strong></p>
        <p v-html="selectedSubTheme" />
        <hr />

        <h4>Composition du bouquet de données ({{ DataPropertiesLength }})
          <DsfrButton
            :icon-only="true"
            size="sm"
            icon="ri-pencil-line"
            title="Editer Étape 3"
            :tertiary="true"
            :no-outline="true"
            @click.prevent="validateAndMoveToStep(3)"
          />
        </h4>
        <div v-if="DataPropertiesLength">
          <DsfrAccordionsGroup>
            <li v-for="datasetProperties in datasetsProperties[datasetsPropertiesKey]">
              <DsfrAccordion
                :title="datasetProperties.libelle"
                :expanded-id="datasetProperties.id"
                @expand="datasetProperties.id = $event"
              >
                <div class="fr-mb-3w">
                  {{ datasetProperties.raison }}
                </div>
                <div class="button__wrapper">
                  <a
                    v-if="datasetProperties.uri"
                    class="fr-btn fr-btn--secondary inline-flex"
                    :href="datasetProperties.uri"
                    target="_blank"
                    >Accéder à la donnée</a
                  >
                </div>
              </DsfrAccordion>
            </li>
          </DsfrAccordionsGroup>
        </div>

        <DsfrButton type="submit" class="block fr-mt-2w fr-ml-auto" label="Publier" />
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

.button__wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
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

.markdown__description {
  :deep a {
    color: var(--text-action-high-blue-france);
  }
}

.fr-accordions-group {
  border: {
    left: 1px solid var(--border-default-grey);
    right: 1px solid var(--border-default-grey);
  }
}
</style>
