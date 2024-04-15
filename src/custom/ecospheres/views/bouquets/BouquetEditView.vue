<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue'
import { ref, computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import config from '@/config'
import BouquetContentFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetContentFieldGroup.vue'
import BouquetFormRecap from '@/custom/ecospheres/components/forms/bouquet/BouquetFormRecap.vue'
import BouquetInformationsFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetInformationsFieldGroup.vue'
import BouquetPropertiesFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetPropertiesFieldGroup.vue'
import {
  type Bouquet,
  type BouquetCreationData,
  type Topic,
  NoOptionSelected
} from '@/model'
import { useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'

const route = useRouteParamsAsString()
const router = useRouter()

const bouquet: Ref<Partial<Bouquet>> = ref({})
const currentStep: Ref<number> = ref(2)
const stepsValidation: Ref<[boolean, boolean, boolean]> = ref([
  false,
  false,
  false
])
const errorMsg: Ref<string | null> = ref(null)
const steps = config.bouquets.steps

const bouquetCreationData: ComputedRef<BouquetCreationData> = computed(() => {
  // we coalesce to empty string to satisfy typing but empty strings should not be allowed
  // by the various validation steps
  return {
    name: bouquet.value.name ?? '',
    description: bouquet.value.description ?? '',
    datasets: datasetsId.value,
    tags: [config.universe.name],
    private: currentStep.value <= stepsValidation.value.length,
    extras: {
      'ecospheres:informations': [
        {
          theme: bouquet.value.theme ?? '',
          subtheme: bouquet.value.subtheme ?? ''
        }
      ],
      'ecospheres:datasets_properties': bouquet.value.datasetsProperties
    },
    spatial: bouquet.value.spatial
  }
})

const datasetsId: ComputedRef<string[]> = computed(() => {
  const datasetsId: string[] = []
  for (const dataset of bouquet.value.datasetsProperties ?? []) {
    if (dataset.id !== null) {
      datasetsId.push(dataset.id)
    }
  }
  return datasetsId
})

const goToPreviousPage = () => {
  currentStep.value--
}

const updateTopic = async () => {
  if (bouquet.value.id === undefined) {
    throw Error('Trying to update topic without topic id')
  }
  return useTopicStore().update(bouquet.value.id, bouquetCreationData.value)
}

const onUpdateDatasets = () => {
  updateTopic()
}

const canDelete = computed(() => {
  return useUserStore().hasEditPermissions(bouquet.value as Bouquet)
})

const doDelete = async () => {
  if (bouquet.value?.id === undefined) {
    throw Error('Trying to delete topic without topic id')
  }
  if (window.confirm('Etes-vous sûr de vouloir supprimer ce bouquet ?')) {
    await useTopicStore().delete(bouquet.value.id)
    router.push({ name: 'bouquets' })
  }
}

const isStepValid = (step: number): boolean => {
  if (step > stepsValidation.value.length) return true
  return stepsValidation.value[step - 1]
}

const updateStepValidation = (step: number, isValid: boolean) => {
  stepsValidation.value[step - 1] = isValid
}

const goToNextStep = () => {
  updateTopic()
    .then((response) => {
      if (currentStep.value > stepsValidation.value.length) {
        router.push({
          name: 'bouquet_detail',
          params: { bid: response.slug }
        })
      } else {
        currentStep.value++
      }
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
}

const fillBouquetFromTopic = (topic: Topic): Bouquet => {
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

/**
 * Depending on topic state, infer the step we should be on
 */
const inferStepFromTopic = (topic: Topic): number => {
  // handle specific case where subtheme and theme are prefilled from creation
  if (route.query?.fromAdd) {
    // cleanup query string (clean bookmark link)
    router.replace({ query: {} })
    return 2
  } else if (topic.extras['ecospheres:datasets_properties']?.length > 0) {
    return 4
  } else if (
    topic.extras['ecospheres:informations'] !== undefined &&
    topic.extras['ecospheres:informations'][0].theme !== NoOptionSelected &&
    topic.extras['ecospheres:informations'][0].subtheme !== NoOptionSelected
  ) {
    return 3
  } else {
    return 2
  }
}

onMounted(() => {
  const loader = useLoading().show()
  useTopicStore()
    .load(route.params.bid)
    .then((topic) => {
      bouquet.value = fillBouquetFromTopic(topic)
      currentStep.value = inferStepFromTopic(topic)
    })
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <form>
      <div class="fr-grid-row">
        <DsfrStepper :steps="steps" :current-step="currentStep" />
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <div v-if="bouquet.id">
        <BouquetPropertiesFieldGroup
          v-if="currentStep == 1"
          v-model:bouquetName="bouquet.name"
          v-model:bouquetDescription="bouquet.description"
          @update-validation="(isValid: boolean) => updateStepValidation(1, isValid)"
        />
        <BouquetInformationsFieldGroup
          v-if="currentStep == 2"
          v-model:theme="bouquet.theme"
          v-model:subtheme="bouquet.subtheme"
          v-model:spatial-field="bouquet.spatial"
          @update-validation="(isValid: boolean) => updateStepValidation(2, isValid)"
        />
        <BouquetContentFieldGroup
          v-if="currentStep == 3"
          v-model:current-datasets="bouquet.datasetsProperties"
          @update-validation="(isValid: boolean) => updateStepValidation(3, isValid)"
          @update-datasets="onUpdateDatasets"
        />
        <BouquetFormRecap
          v-if="currentStep == 4"
          :bouquet="bouquet as Bouquet"
          @update-step="(step: number) => (currentStep = step)"
        />
      </div>
      <div class="flex align-start fr-mt-3w">
        <DsfrButton
          v-if="canDelete"
          type="button"
          label="Supprimer le bouquet"
          class="fr-mt-2w fr-mr-2w"
          icon="ri-delete-bin-line"
          secondary
          @click="doDelete"
        />
        <div class="fr-ml-auto fr-mt-2w">
          <DsfrButton
            v-if="currentStep > 1"
            type="button"
            class="fr-mr-2w"
            label="Précédent"
            @click.prevent="goToPreviousPage"
          />
          <DsfrButton
            type="button"
            :label="currentStep === 4 ? 'Publier' : 'Suivant'"
            :disabled="!isStepValid(currentStep)"
            @click.prevent="goToNextStep()"
          />
        </div>
      </div>
    </form>
  </div>
</template>
