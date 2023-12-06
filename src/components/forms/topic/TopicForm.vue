<template>
  <div class="app">
    <form class="checkout-form">
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-lg-7">
          <DsfrStepper :steps="steps" :current-step="currentStep" />
        </div>
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      {{ $data }}
      <TopicPropertiesFieldGroup
        v-if="currentStep >= 0"
        @updateValidation="(isValid) => updateStepValidation(1, isValid)"
        v-model:topicName="topic.name"
        v-model:topicDescription="topic.description"
      />
      <hr style="background: orange" />
      <TopicThemeFieldGroup
        v-if="currentStep >= 0"
        v-model:theme="topic.theme"
        v-model:subtheme="topic.subtheme"
      />
      <hr style="background: orange" />
      <TopicContentFieldGroup
        v-if="currentStep >= 0"
        v-model:datasets="topic.datasetsProperties"
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
        <DsfrButton v-else @click="submitForm" label="Ajouter le bouquet" />
      </div>
      <TopicFormRecap :topic="topic" />
      {{ topic }}
    </form>
  </div>
</template>

<script lang="ts">
import type { Topic } from '@/model'

import TopicContentFieldGroup from './TopicContentFieldGroup.vue'
import TopicFormRecap from './TopicFormRecap.vue'
import TopicPropertiesFieldGroup from './TopicPropertiesFieldGroup.vue'
import TopicThemeFieldGroup from './TopicThemeFieldGroup.vue'

const NoValidationNeeded = true

interface TopicFormData {
  topic: Partial<Topic>
  currentStep: number
  stepsValidation: [boolean, boolean, boolean]
  errorMsg: string | null
}

export default {
  name: 'TopicForm',
  components: {
    TopicPropertiesFieldGroup: TopicPropertiesFieldGroup,
    TopicThemeFieldGroup: TopicThemeFieldGroup,
    TopicContentFieldGroup: TopicContentFieldGroup,
    TopicFormRecap: TopicFormRecap
  },
  data(): TopicFormData {
    return {
      topic: {},
      currentStep: 1,
      stepsValidation: [false, NoValidationNeeded, NoValidationNeeded],
      errorMsg: null
    }
  },
  computed: {
    steps() {
      return [
        'Description du bouquet de données',
        'Informations du bouquet de données',
        'Composition du bouquet de données',
        'Récapitulatif'
      ]
    }
  },
  methods: {
    goToPreviousPage() {
      this.currentStep--
    },
    submitForm() {
      alert(
        'form submitted now: ' + this.topic.name + ' ' + this.topic.description
      )
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
