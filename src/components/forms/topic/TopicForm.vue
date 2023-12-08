<template>
  <div class="app">
    <form class="fr-col-12 fr-col-lg-7">
      <div class="fr-grid-row">
        <DsfrStepper :steps="steps" :current-step="currentStep" />
      </div>
      <div class="fr-mt-4v">
        <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
      </div>
      <TopicPropertiesFieldGroup
        v-if="currentStep == 1"
        @updateValidation="(isValid) => updateStepValidation(1, isValid)"
        v-model:topicName="topic.name"
        v-model:topicDescription="topic.description"
      />
      <TopicThemeFieldGroup
        v-if="currentStep == 2"
        @updateValidation="(isValid) => updateStepValidation(2, isValid)"
        v-model:theme="topic.theme"
        v-model:subtheme="topic.subtheme"
      />
      <TopicContentFieldGroup
        v-if="currentStep == 3"
        @updateValidation="(isValid) => updateStepValidation(3, isValid)"
        :currentDatasets="topic.datasetsProperties"
      />
      <TopicFormRecap
        v-if="currentStep == 4"
        @updateStep="(step) => (currentStep = step)"
        :topic="topic"
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
    </form>
  </div>
</template>

<script lang="ts">
import config from '@/config'
import type { Topic, TopicCreationData } from '@/model'

import { useTopicStore } from '../../../store/TopicStore'
import TopicContentFieldGroup from './TopicContentFieldGroup.vue'
import TopicFormRecap from './TopicFormRecap.vue'
import TopicPropertiesFieldGroup from './TopicPropertiesFieldGroup.vue'
import TopicThemeFieldGroup from './TopicThemeFieldGroup.vue'

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
      topic: {
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
    topicCreationData(): TopicCreationData {
      return {
        name: this.topic.name,
        description: this.topic.description,
        datasets: this.datasetsId,
        tags: [config.universe.name],
        extras: {
          [`${config.universe.name}:informations`]: [
            {
              theme: this.topic.theme,
              subtheme: this.topic.subtheme
            }
          ],
          [`${config.universe.name}:datasets_properties`]:
            this.topic.datasetsProperties
        }
      }
    },
    datasetsId(): string[] {
      const datasetsId: string[] = []
      for (const dataset of this.topic.datasetsProperties) {
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
      let response = await useTopicStore().create(this.topicCreationData)
      if (response.status && response.status === 400) {
        this.errorMsg = 'Merci de bien remplir les champs'
      } else {
        alert(JSON.stringify(response))
        //this.$router.push({ name: 'bouquet_detail', params: { bid: response.slug } })
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
