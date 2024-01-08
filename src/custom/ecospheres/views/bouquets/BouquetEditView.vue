<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'
import BouquetContentFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetContentFieldGroup.vue'
import BouquetFormRecap from '@/custom/ecospheres/components/forms/bouquet/BouquetFormRecap.vue'
import BouquetPropertiesFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetPropertiesFieldGroup.vue'
import BouquetThemeFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetThemeFieldGroup.vue'
import type { Bouquet, BouquetCreationData, DatasetProperties } from '@/model'
import { useTopicStore } from '@/store/TopicStore'

const router = useRouter()

const bouquet: Ref<
  Partial<Bouquet> & { datasetsProperties: DatasetProperties[] }
> = ref({
  datasetsProperties: [] as DatasetProperties[]
})
const currentStep: Ref<number> = ref(1)
const stepsValidation: Ref<[boolean, boolean, boolean]> = ref([
  false,
  false,
  false
])
const errorMsg: Ref<string | null> = ref(null)
const bouquetId: Ref<string | null> = ref(null)
const steps = config.bouquets.steps

const bouquetCreationData: ComputedRef<BouquetCreationData> = computed(() => {
  // we coalesce to empty string to satisfy typing but empty strings should not be allowed
  // by the various validation steps
  return {
    name: bouquet.value.name ?? '',
    description: bouquet.value.description ?? '',
    datasets: datasetsId.value,
    tags: [config.universe.name],
    private:
      !allStepAreValid.value ||
      currentStep.value <= stepsValidation.value.length,
    extras: {
      'ecospheres:informations': [
        {
          theme: bouquet.value.theme ?? '',
          subtheme: bouquet.value.subtheme ?? ''
        }
      ],
      'ecospheres:datasets_properties': bouquet.value.datasetsProperties
    }
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

const allStepAreValid: ComputedRef<boolean> = computed(() => {
  for (const step of stepsValidation.value) {
    if (step === false) {
      return false
    }
  }
  return true
})

const goToPreviousPage = () => {
  currentStep.value--
}

const createTopic = async () => {
  return useTopicStore().create(bouquetCreationData.value)
}

const updateTopic = async () => {
  if (bouquetId.value === null) {
    throw Error('Trying to update topic without topic id')
  }
  return useTopicStore().update(bouquetId.value, bouquetCreationData.value)
}

const isStepValid = (step: number) => {
  if (step > stepsValidation.value.length) return allStepAreValid.value
  return stepsValidation.value[step - 1]
}

const updateStepValidation = (step: number, isValid: boolean) => {
  stepsValidation.value[step - 1] = isValid
}

// TODO: catch errors
const goToNextStep = () => {
  // this is a failsafe that should never be triggered
  if (!isStepValid(currentStep.value)) {
    throw Error(`Invalid step ${currentStep.value}, can not proceed`)
  }
  if (currentStep.value === 1) {
    createTopic().then((response) => {
      bouquetId.value = response.id
      currentStep.value++
    })
  } else {
    updateTopic().then((response) => {
      if (currentStep.value > stepsValidation.value.length) {
        router.push({
          name: 'bouquet_detail',
          params: { bid: response.slug }
        })
      } else {
        currentStep.value++
      }
    })
  }
}
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <form class="fr-col-12 fr-col-lg-7">
      <div class="fr-grid-row">
        <DsfrStepper :steps="steps" :current-step="currentStep" />
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <BouquetPropertiesFieldGroup
        v-if="currentStep == 1"
        v-model:bouquetName="bouquet.name"
        v-model:bouquetDescription="bouquet.description"
        @update-validation="(isValid: boolean) => updateStepValidation(1, isValid)"
      />
      <BouquetThemeFieldGroup
        v-if="currentStep == 2"
        v-model:theme="bouquet.theme"
        v-model:subtheme="bouquet.subtheme"
        @update-validation="(isValid: boolean) => updateStepValidation(2, isValid)"
      />
      <BouquetContentFieldGroup
        v-if="currentStep == 3"
        :current-datasets="bouquet.datasetsProperties"
        @update-validation="(isValid: boolean) => updateStepValidation(3, isValid)"
      />
      <BouquetFormRecap
        v-if="currentStep == 4"
        :bouquet="bouquet"
        @update-step="(step: number) => (currentStep = step)"
      />
      <div class="fit fr-mt-3w fr-ml-auto">
        <DsfrButton
          v-if="currentStep > 1"
          type="button"
          class="fr-mt-2w fr-mr-2w"
          label="Précédent"
          @click.prevent="goToPreviousPage"
        />
        <DsfrButton
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!isStepValid(currentStep)"
          @click.prevent="goToNextStep()"
        />
      </div>
    </form>
  </div>
</template>
