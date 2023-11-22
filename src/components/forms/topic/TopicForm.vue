<template>
  <div class="app">
    <form @submit.prevent="handleSubmit" class="checkout-form">
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-lg-7">
          <DsfrStepper :steps="steps" :current-step="currentStep" />
        </div>
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <TopicPropertiesFieldGroup
        v-model:topicName="topicData.name"
        v-model:topicDescription="topicData.description"
        declareFormAsValid="() => {console}"
      />
      <div class="fit fr-mt-3w fr-ml-auto">
        <DsfrButton
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
        <DsfrButton v-else type="submit" label="Ajouter le bouquet" />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import type { DatasetProperties, Topic } from '@/model'

import TopicContentFieldGroup from './TopicContentFieldGroup.vue'
import TopicFormRecap from './TopicFormRecap.vue'
import TopicPropertiesFieldGroup from './TopicPropertiesFieldGroup.vue'

interface TopicFormData {
  topicData: Partial<Topic>
  currentStep: number
  errorMsg: string | null
  stepValidation: [boolean, boolean, boolean]
}

export default {
  name: 'TopicForm',
  components: {
    TopicPropertiesFieldGroup: TopicPropertiesFieldGroup,
    TopicContentFieldGroup: TopicContentFieldGroup,
    TopicFormRecap: TopicFormRecap
  },
  props: {
    currentName: {
      type: String,
      default: ''
    },
    currentDescription: {
      type: String,
      default: ''
    },
    currentDatasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  data(): TopicFormData {
    return {
      topicData: {},
      currentStep: 1,
      errorMsg: null,
      stepValidation: [false, false, false]
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
      this.$router.go(-1)
    },
    handleSubmit() {
      alert(
        'form submitted : ' +
          this.topicData.name +
          ' ' +
          this.topicData.description
      )
    },
    isStepValid(step: number) {
      return this.stepValidation[step - 1]
    },
    goToNextStep() {
      this.currentStep++
    }
  }
}
</script>
