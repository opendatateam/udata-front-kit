<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import config from '@/config'
import BouquetPropertiesFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetPropertiesFieldGroup.vue'
import {
  NoOptionSelected,
  type Bouquet,
  type BouquetCreationData
} from '@/model'
import { useTopicStore } from '@/store/TopicStore'

const router = useRouter()
const route = useRoute()

const bouquet: Ref<Partial<Bouquet>> = ref({})
const isStepValid: Ref<boolean> = ref(false)
const errorMsg: Ref<string | null> = ref(null)
const steps = config.bouquets.steps

const bouquetCreationData: ComputedRef<BouquetCreationData> = computed(() => {
  return {
    name: bouquet.value.name ?? '',
    description: bouquet.value.description ?? '',
    tags: [config.universe.name],
    private: true,
    extras: {
      'ecospheres:informations': [
        {
          theme: route.query.theme ?? NoOptionSelected,
          subtheme: route.query.subtheme ?? NoOptionSelected
        }
      ]
    },
    spatial: route.query.geozone ? { zones: [route.query.geozone] } : null
  }
})

const createTopic = async () => {
  return useTopicStore().create(bouquetCreationData.value)
}

const submit = () => {
  createTopic()
    .then((response) => {
      router.push({
        name: 'bouquet_edit',
        params: { bid: response.id },
        query: { fromAdd: '1' }
      })
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
}
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <form>
      <div class="fr-grid-row">
        <DsfrStepper :steps="steps" :current-step="1" />
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <BouquetPropertiesFieldGroup
        v-model:bouquetName="bouquet.name"
        v-model:bouquetDescription="bouquet.description"
        @update-validation="(isValid: boolean) => isStepValid = isValid"
      />
      <div class="fit fr-mt-3w fr-ml-auto">
        <DsfrButton
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!isStepValid"
          @click.prevent="submit()"
        />
      </div>
    </form>
  </div>
</template>
