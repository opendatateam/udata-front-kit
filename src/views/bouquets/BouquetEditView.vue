<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Tooltip from '@/components/Tooltip.vue'
import config from '@/config'
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
const thematiques = [
   'Produire',
   'Se nourrir',
   'Se loger',
   'Se déplacer',
   'Préserver',
   'Consommer',
   'Chantiers transverses'
]
const selectedThematique = ref('Produire')
const selectedSubTheme = ref('Nucléaire')
const currentStep = ref(1)

const subThemes = computed(() => {
  return getOptions(selectedThematique.value)
})

const getOptions = (selectSubtheme) => {
  switch (selectSubtheme) {
    case 'Produire':
      return [
        'Nucléaire',
        'Tertiaire (incluant les bâtiments publics de l\'État et des collectivités, hors logement)',
        'Production d\'électricité décarbonée (hors nucléaire)',
        'Production d\'énergie décarbonnée (hors éléctricité)',
        'Prévention, gestion et valorisation des déchets',
        'Transport de marchandises, logistique, e-commerce',
        'Verdissement du secteur et des instruments financiers',
        'Décarbonation de l’industrie',
      ];
    case 'Se nourrir':
      return [
        'Alimentation',
        'Agriculture et pêche'
      ];
    case 'Se loger':
      return [
        'Construction et rénovation des logements',
        'Aménagements des villes'
      ];
    case 'Se déplacer':
      return [
        'Voitures et infrastructures routières',
        'Mobilité courte distance (hors voiture)',
        'Mobilité longue distance (avion, train)'
      ];
    case 'Préserver':
      return [
        'Eau',
        'Sols',
        'Océans et mers',
        'Forêt'
      ];
    case 'Consommer':
      return [
        'Consommation plus durable (ménages)',
        'Numérique responsable',
        'Achats durables (de l’État, des collectivités et des entreprises)'
      ];
    case 'Chantiers transverses':
      return [
        'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes',
        'La planification et la différenciation territoriale selon les caractéristiques et les spécificités de chaque territoire, incluant les territoires ultra-marins',
        'La transition des filières avec la gestion des emplois, des formations et des compétences',
        'Les données environnementales',
        'Les services publics exemplaires',
        'La transition juste et les mesures d’accompagnement, pour ne laisser personne au bord du chemin',
        'La sobriété des usages et des ressources'
      ];
    default:
      return [];
  }
}

const getOptionDefault = (theme) => {
  switch (theme) {
    case 'Produire':
      return 'Nucléaire'
    case 'Se nourrir':
      return 'Alimentation'
    case 'Se loger':
      return 'Construction et rénovation des logements'
    case 'Se déplacer':
      return 'Voitures et infrastructures routières'
    case 'Préserver':
      return 'Eau'
    case 'Consommer':
      return 'Consommation plus durable (ménages)'
    case 'Chantiers transverses':
      return 'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes'
    default:
      return null
  }
}

const onSubmit = async () => {
  let res
  const data = {
    ...form.value
  }

  const extras = {
    informations: [{
      'theme': selectedThematique.value,
      'sub-theme': selectedSubTheme.value
    }]
  };

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

watch(selectedThematique, (theme) => {
  selectedSubTheme.value = getOptionDefault(theme)
})

onMounted(() => {
  console.log('form.value', form.value)
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
        <DsfrButton type="button" class="fr-mt-2w" label="Suivant" @click="currentStep= 2" />
      </div>
    
      <div v-show="currentStep === 2">
        <div class="fr-grid-row">
            <div class="fr-col-12 fr-col-lg-8">
              <div>
                <div class="fr-grid-row justify-between">
                  <div class="fr-col-12 fr-col-sm-45">
                    <DsfrSelect
                      v-model="selectedThematique"
                      label="Thématique"
                      :options="thematiques"
                      :model-value="selectedThematique"
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
