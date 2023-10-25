<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Tooltip from '@/components/Tooltip.vue'
import config from '@/config'
import { getSubThemes } from '@/utils'
import { useTopicStore } from '@/store/TopicStore'

const topicStore = useTopicStore()
const router = useRouter()
const route = useRoute()

const isCreate = route.name === 'bouquet_add'

const form = ref({})
const loadedBouquet = ref({})
const isFormValidated = ref(false)
const errorMessage = ref()
const steps = [
  'Description du bouquet de données',
  'Informations du bouquet de données',
  'Composition du bouquet',
  'Récapitulatif'
]

const selectedTheme = ref(config.themes.selectedThemeDefault);
const selectedSubTheme = ref(config.themes.selectedSubThemeDefault)
const currentStep = ref(1)

const subThemes = computed(() => {
  return getSubThemes(selectedTheme.value)
})

const getOptionDefault = (theme) => {
  if (config.themes.default_options.hasOwnProperty(theme)) {
    return config.themes.default_options[theme]
  }

  return null
}

const onThemeChanged = () => {
  selectedSubTheme.value = getOptionDefault(selectedTheme.value);
}

const validateAndMoveToStep2 = (newStep) => {
  if (!form.value.name || !form.value.description) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    currentStep.value = newStep
  }
}

const onSubmit = async () => {
  let res
  const data = {
    ...form.value
  }

  const extras = {
    [`${config.universe.name}:informations`]: [{
      theme: selectedTheme.value,
      subtheme: selectedSubTheme.value
    }]
  }

  if (isCreate) {
    res = await topicStore.create({
      ...data,
      tags: [config.universe.name],
      extras: extras
    })
  } else {
    res = await topicStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
      extras: { ...loadedBouquet.value.extras, ...extras}
    })
  }

  if (res.status && res.status === 400) {
    errorMessage.value = 'Merci de bien remplir les champs'
  } else {
    setTimeout(() => {
      router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
    }, 1000)
  }
}

onMounted(() => {
  if (!isCreate) {
    topicStore.load(route.params.bid).then((data) => {
      loadedBouquet.value = data
      form.value.name = data.name
      form.value.description = data.description
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
                  v-if="isFormValidated && !errorMessage"
                  type="success"
                  title="Bouquet créé"
                  description="Votre bouquet a bien été créé."
                />
                <DsfrAlert v-if="errorMessage" type="warning" :title="errorMessage" />
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
        <DsfrButton type="button" class="fr-mt-2w" label="Suivant" @click.prevent="validateAndMoveToStep2(2)" />
      </div>
    
      <div v-show="currentStep === 2">
        <div class="fr-grid-row">
            <div class="fr-col-12 fr-col-lg-8">
              <div>
                <div class="fr-grid-row justify-between">
                  <div class="fr-col-12 fr-col-sm-45">
                    <DsfrSelect
                      v-model="selectedTheme"
                      label="Thématique"
                      :options="config.themes.thematiques"
                      :model-value="selectedTheme"
                      @change="onThemeChanged"
                    />
                  </div>
                  <div class="fr-col-12 fr-col-sm-45">
                    <DsfrSelect
                      v-model="selectedSubTheme"
                      label="Chantier"
                      :options="subThemes"
                      :model-value="selectedSubTheme"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DsfrButton type="submit" class="fr-mt-2w" label="Suivant" />
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

.fr-col-sm-45 {
  flex: 0 0 45%;
  max-width: 45%;
  width: 45%;
}

.justify-between {
  justify-content: space-between;
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
</style>