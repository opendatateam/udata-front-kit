<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue'
import { ref, computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import config from '@/config'
import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import BouquetInformationsFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetInformationsFieldGroup.vue'
import BouquetPropertiesFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetPropertiesFieldGroup.vue'
import {
  NoOptionSelected,
  type Bouquet,
  type BouquetEditionData,
  type Topic,
  type DatasetProperties
} from '@/model'
import { useRouteQueryAsString, useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'

const props = defineProps({
  isCreate: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const routeParams = useRouteParamsAsString().params
const routeQuery = useRouteQueryAsString().query

const stepsValidation: Ref<[boolean, boolean]> = ref([false, false])
const isCreateInited: Ref<boolean> = ref(false)
const title: Ref<string> = ref('Nouveau bouquet')
const bouquet: Ref<Partial<Bouquet>> = ref({})
const errorMsg: Ref<string | null> = ref(null)

const datasetsId: ComputedRef<string[]> = computed(() => {
  const datasetsId: string[] = []
  for (const dataset of bouquet.value.datasetsProperties ?? []) {
    if (dataset.id !== null) {
      datasetsId.push(dataset.id)
    }
  }
  return datasetsId
})

const canSave: ComputedRef<boolean> = computed(() => {
  return stepsValidation.value.every(Boolean)
})

const save = () => {
  if (props.isCreate) {
    createTopic()
  } else {
    updateTopic()
  }
}

// TODO: maybe store a local version at first load and after each save
// and restore it after cancel
// right now we're autosaving the whole form when datasets list changes
const cancel = () => {
  router.push({ name: 'bouquets' })
}

const publish = () => {
  bouquet.value.private = false
  updateTopic().then((response) => {
    if (response) {
      router.push({
        name: 'bouquet_detail',
        params: { bid: response.slug }
      })
    }
  })
}

const goToDatasetAdd = () => {
  router.push({
    name: 'bouquet_dataset_add',
    params: { bid: bouquet.value.id }
  })
}

const removeDataset = (index: number) => {
  if (bouquet.value.datasetsProperties === undefined) return
  bouquet.value.datasetsProperties.splice(index, 1)
  updateTopic()
}

const reorderDatasets = () => {
  updateTopic()
}

const editDataset = ({
  index,
  data
}: {
  index: number
  data: DatasetProperties
}) => {
  if (bouquet.value.datasetsProperties === undefined) return
  bouquet.value.datasetsProperties[index] = data
  updateTopic()
}

const createTopic = () => {
  useTopicStore()
    .create(getBouquetEditionData())
    .then((response) => {
      // we're not really changing route (same component), so fill value locally
      bouquet.value = fillBouquetFromTopic(response)
      router.push({
        name: 'bouquet_edit',
        params: { bid: response.id }
      })
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
}

const updateTopic = async () => {
  if (bouquet.value.id === undefined) {
    throw Error('Trying to update topic without topic id')
  }
  const loader = useLoading().show()
  return useTopicStore()
    .update(bouquet.value.id, getBouquetEditionData())
    .then((response) => {
      title.value = response.name
      return response
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
    .finally(() => loader.hide())
}

const getBouquetEditionData = (): BouquetEditionData => {
  return {
    name: bouquet.value.name ?? '',
    description: bouquet.value.description ?? '',
    datasets: datasetsId.value,
    tags: [config.universe.name],
    private: bouquet.value.private ?? true,
    extras: {
      'ecospheres:informations': [
        {
          theme: bouquet.value.theme || NoOptionSelected,
          subtheme: bouquet.value.subtheme || NoOptionSelected
        }
      ],
      'ecospheres:datasets_properties': bouquet.value.datasetsProperties || []
    },
    spatial: bouquet.value.spatial
  }
}

const fillBouquetFromTopic = (topic: Topic): Bouquet => {
  title.value = topic.name
  const getInfoFromExtras = (
    info: 'theme' | 'subtheme',
    topic: Topic
  ): string | undefined => {
    const key = 'ecospheres:informations'
    if (topic.extras[key] !== undefined) {
      return topic.extras[key][0][info]
    }
  }
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    theme: getInfoFromExtras('theme', topic),
    subtheme: getInfoFromExtras('subtheme', topic),
    datasetsProperties: topic.extras['ecospheres:datasets_properties'] ?? [],
    owner: topic.owner,
    organization: topic.organization,
    spatial: topic.spatial,
    private: topic.private
  } as Bouquet
}

onMounted(() => {
  // prefill bouquet info from query if create mode
  if (props.isCreate) {
    bouquet.value.theme = routeQuery.theme || NoOptionSelected
    bouquet.value.subtheme = routeQuery.subtheme || NoOptionSelected
    bouquet.value.spatial = routeQuery.geozone
      ? { zones: [routeQuery.geozone] }
      : undefined
    isCreateInited.value = true
  }
  // or load existing bouquet from API
  else {
    const loader = useLoading().show()
    useTopicStore()
      .load(routeParams.bid)
      .then((topic) => {
        bouquet.value = fillBouquetFromTopic(topic)
      })
      .finally(() => loader.hide())
  }
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <form>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <div
        class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
      >
        <h1 class="fr-col-auto fr-mb-2v">{{ title }}</h1>
        <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
          <DsfrButton
            secondary
            class="fr-mb-1w"
            label="Annuler"
            @click.prevent="cancel"
          />
          <DsfrButton
            :disabled="!canSave"
            class="fr-mb-1w fr-ml-1w"
            label="Enregistrer"
            @click.prevent="save"
          />
          <DsfrButton
            :disabled="!canSave"
            class="fr-mb-1w fr-ml-1w"
            label="Publier"
            @click.prevent="publish"
          />
        </div>
      </div>
      <div v-if="(isCreate && isCreateInited) || bouquet.id" class="fr-mt-4w">
        <h2>Description du bouquet de données</h2>
        <!-- TODO: only one component when layout is final -->
        <BouquetPropertiesFieldGroup
          v-model:bouquet-name="bouquet.name"
          v-model:bouquet-description="bouquet.description"
          @update-validation="(isValid: boolean) => stepsValidation[0] = isValid"
        />
        <BouquetInformationsFieldGroup
          v-model:theme="bouquet.theme"
          v-model:subtheme="bouquet.subtheme"
          v-model:spatial-field="bouquet.spatial"
          @update-validation="(isValid: boolean) => stepsValidation[1] = isValid"
        />
        <hr />
        <div
          class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
        >
          <h2 class="fr-col-auto fr-mb-2v">
            Composition du bouquet de données
          </h2>
          <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
            <DsfrButton
              :disabled="!canSave"
              class="fr-mb-1w fr-ml-1w"
              label="Ajouter un jeu de données"
              icon="ri-add-line"
              @click.prevent="goToDatasetAdd"
            />
          </div>
        </div>
        <BouquetDatasetList
          :is-edit="true"
          :datasets="bouquet.datasetsProperties"
          @remove-dataset="removeDataset"
          @edit-dataset="editDataset"
          @reorder-datasets="reorderDatasets"
        />
      </div>
      <hr />
      <div
        class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--right fr-pb-1w"
      >
        <div class="fr-col-auto">
          <DsfrButton
            secondary
            class="fr-mb-1w"
            label="Annuler"
            @click.prevent="cancel"
          />
          <DsfrButton
            :disabled="!canSave"
            class="fr-mb-1w fr-ml-1w"
            label="Enregistrer"
            @click.prevent="save"
          />
          <DsfrButton
            :disabled="!canSave"
            class="fr-mb-1w fr-ml-1w"
            label="Publier"
            @click.prevent="publish"
          />
        </div>
      </div>
    </form>
  </div>
</template>
