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
  type BouquetCreationData,
  type Topic
} from '@/model'
import { useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'

const props = defineProps({
  isCreate: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
// FIXME: use params to pre-fill bouquet
const route = useRouteParamsAsString()

const isMinimalValid: Ref<boolean> = ref(false)
const title: Ref<string> = ref('Nouveau bouquet')
const bouquet: Ref<Partial<Bouquet>> = ref({})
const errorMsg: Ref<string | null> = ref(null)
const stepsCompletion: Ref<[boolean, boolean, boolean]> = ref([
  false,
  false,
  false
])

const datasetsId: ComputedRef<string[]> = computed(() => {
  const datasetsId: string[] = []
  for (const dataset of bouquet.value.datasetsProperties ?? []) {
    if (dataset.id !== null) {
      datasetsId.push(dataset.id)
    }
  }
  return datasetsId
})

const bouquetCreationData: ComputedRef<BouquetCreationData> = computed(() => {
  return {
    name: bouquet.value.name ?? '',
    description: bouquet.value.description ?? '',
    datasets: datasetsId.value,
    tags: [config.universe.name],
    // TODO: make dynamic
    private: true,
    extras: {
      'ecospheres:informations': [
        {
          theme: bouquet.value.theme ?? route.query.theme ?? NoOptionSelected,
          subtheme:
            bouquet.value.subtheme ?? route.query.subtheme ?? NoOptionSelected
        }
      ],
      'ecospheres:datasets_properties': bouquet.value.datasetsProperties
    },
    // FIXME: bug on that, not always filled
    // the route logic should probably be if (isCreate)
    // maybe use props on the route for easier reactivity?
    spatial:
      bouquet.value.spatial ?? route.query.geozone
        ? { zones: [route.query.geozone] }
        : null
  }
})

const canSave: ComputedRef<boolean> = computed(() => {
  return isMinimalValid.value
})

const canPublish: ComputedRef<boolean> = computed(() => {
  return stepsCompletion.value.every(Boolean)
})

const completion: ComputedRef<number> = computed(() => {
  return (
    stepsCompletion.value.filter((v) => v === true).length /
    stepsCompletion.value.length
  )
})

const save = () => {
  if (props.isCreate) {
    createTopic()
  } else {
    updateTopic()
  }
}

const cancel = () => {
  router.push({ name: 'bouquets' })
}

const publish = () => {
  console.log('publish!')
}

const createTopic = () => {
  useTopicStore()
    .create(bouquetCreationData.value)
    .then((response) => {
      router.push({
        name: 'bouquet_edit',
        params: { bid: response.id }
      })
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
}

const updateTopic = () => {
  if (bouquet.value.id === undefined) {
    throw Error('Trying to update topic without topic id')
  }
  const loader = useLoading().show()
  useTopicStore()
    .update(bouquet.value.id, bouquetCreationData.value)
    .then((response) => {
      title.value = response.name
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
    .finally(() => loader.hide())
}

// TODO: factorize with bouquetCreationData?
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
    spatial: topic.spatial
  } as Bouquet
}

onMounted(() => {
  if (props.isCreate) return
  const loader = useLoading().show()
  useTopicStore()
    .load(route.params.bid)
    .then((topic) => {
      bouquet.value = fillBouquetFromTopic(topic)
    })
    .finally(() => loader.hide())
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
            :disabled="!canPublish"
            class="fr-mb-1w fr-ml-1w"
            label="Publier"
            @click.prevent="publish"
          />
        </div>
      </div>
      <div class="fr-col-md-5">
        <div>Bouquet complété à {{ Math.round(completion * 100) }}%</div>
        <progress style="width: 100%" max="100" :value="completion * 100">
          {{ completion * 100 }}%
        </progress>
      </div>
      <div v-if="isCreate || bouquet.id" class="fr-mt-4w">
        <h2>Description du bouquet de données</h2>
        <BouquetPropertiesFieldGroup
          v-model:bouquet-name="bouquet.name"
          v-model:bouquet-description="bouquet.description"
          @update-validation="(isValid: boolean) => isMinimalValid = isValid"
          @update-completion="(isComplete: boolean) => stepsCompletion[0] = isComplete"
        />
        <hr />
        <h2>Informations du bouquet de données</h2>
        <BouquetInformationsFieldGroup
          v-model:theme="bouquet.theme"
          v-model:subtheme="bouquet.subtheme"
          v-model:spatial-field="bouquet.spatial"
          @update-completion="(isComplete: boolean) => stepsCompletion[1] = isComplete"
        />
        <hr />
        <h2>Composition du bouquet de données</h2>
        <!-- TODO: update-completion event -->
        <BouquetDatasetList
          :datasets="bouquet.datasetsProperties"
          @update-completion="(isComplete: boolean) => stepsCompletion[2] = isComplete"
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
            :disabled="!canPublish"
            class="fr-mb-1w fr-ml-1w"
            label="Publier"
            @click.prevent="publish"
          />
        </div>
      </div>
    </form>
  </div>
</template>
