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
          v-if="currentStep < 4"
          type="button"
          class="fr-mt-2w"
          label="Suivant"
          :disabled="!isStepValid(currentStep)"
          @click.prevent="goToNextStep()"
        />
        <DsfrButton
          v-else
          label="Ajouter le bouquet"
          @click.prevent="submitForm"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import config from '@/config'
import BouquetContentFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetContentFieldGroup.vue'
import BouquetFormRecap from '@/custom/ecospheres/components/forms/bouquet/BouquetFormRecap.vue'
import BouquetPropertiesFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetPropertiesFieldGroup.vue'
import BouquetThemeFieldGroup from '@/custom/ecospheres/components/forms/bouquet/BouquetThemeFieldGroup.vue'
import type { Bouquet, BouquetCreationData } from '@/model'
import { useTopicStore } from '@/store/TopicStore'

interface BouquetFormData {
  bouquet: Partial<Bouquet>
  currentStep: number
  stepsValidation: [boolean, boolean, boolean]
  errorMsg: string | null
}

export default {
  name: 'BouquetEditView',
  components: {
    BouquetPropertiesFieldGroup,
    BouquetThemeFieldGroup,
    BouquetContentFieldGroup,
    BouquetFormRecap
  },
  data(): BouquetFormData {
    return {
      bouquet: {
        datasetsProperties: []
      },
      currentStep: 1,
      stepsValidation: [false, false, false],
      errorMsg: null
    }
  },
  computed: {
    steps() {
      return [
        'Description du bouquet de données',
        'Informations du bouquet de données',
        'Composition du bouquet de données',
        'Récapitulatif du bouquet de données'
      ]
    },
    bouquetCreationData(): BouquetCreationData {
      return {
        name: this.bouquet.name,
        description: this.bouquet.description,
        datasets: this.datasetsId,
        tags: [config.universe.name],
        extras: {
          [`${config.universe.name}:informations`]: [
            {
              theme: this.bouquet.theme,
              subtheme: this.bouquet.subtheme
            }
          ],
          [`${config.universe.name}:datasets_properties`]:
            this.bouquet.datasetsProperties
        }
      }
    },
    datasetsId(): string[] {
      const datasetsId: string[] = []
      for (const dataset of this.bouquet.datasetsProperties) {
        if (dataset.id !== null) {
          datasetsId.push(dataset.id)
        }
      }
      return datasetsId
    },
    allStepAreValid(): boolean {
      for (const step of this.stepsValidation) {
        if (step === false) {
          return false
        }
      }
      return true
    }
  },
  methods: {
    goToPreviousPage() {
      this.currentStep--
    },
    submitForm() {
      if (this.allStepAreValid) {
        this.createTopic()
      } else {
        this.errorMsg = 'Merci de bien remplir les champs' // TODO -- improve errorMsg (which step is faulty, what is the condition for it to be accepted)
      }
    },
    async createTopic() {
      const response = await useTopicStore().create(this.bouquetCreationData)
      if (response.status && response.status === 400) {
        this.errorMsg = 'Merci de bien remplir les champs'
      } else {
        this.$router.push({
          name: 'bouquet_detail',
          params: { bid: response.slug }
        })
      }
    },
    isStepValid(step: number) {
      return this.stepsValidation[step - 1]
    },
    updateStepValidation(step: number, isValid: boolean) {
      this.stepsValidation[step - 1] = isValid
    },
    goToNextStep() {
      this.currentStep++
    }
  }
}
</script>
