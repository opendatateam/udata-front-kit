<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTopicStore } from '@/store/TopicStore'
import config from '@/config'

const topicStore = useTopicStore()
const router = useRouter()
const route = useRoute()
const props = defineProps({
  nextStep: Function,
})
const isCreate = route.name === 'bouquet_add'

const form = ref({})
const informations = ref([])
const selectedThematique = ref('Produire')
const selectedSubTheme = ref('Nucléaire')

const thematiques = [
   'Produire',
   'Se nourrir',
   'Se loger',
   'Se déplacer',
   'Préserver',
   'Consommer',
   'Chantiers transverses'
]

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

watch(selectedThematique, (theme) => {
  selectedSubTheme.value = getOptionDefault(theme)
})

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

const extrasFromDatasets = () => {
  const extras = {}
  // Ajoute l'objet informations à extras sous la clé "informations"
  extras['informations'] = [{
    'theme': selectedThematique.value,
    'sub-theme': selectedSubTheme.value
  }];

  return extras;
};

const handleNext = async () => {
  let res
  const data = {
    ...form.value
  }

  if (isCreate) {
    res = await topicStore.create({
      ...data,
      tags: [config.universe.name],
      extras: extrasFromDatasets(),
    })
    console.log('res create', res)
  } else { 
      res = await topicStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
      extras: { ...loadedBouquet.value.extras, ...extrasFromDatasets()}
    })
    console.log('res update', res)
  }

  if (res.status && res.status === 400) {
    console.log('res.status', res.status)
  } else {
    console.log('data', informations)
  }

  // props.nextStep()
  // if (res.status && res.status === 400) {
  //   errorMessage.value = 'Merci de bien remplir les champs'
  // } else {
    setTimeout(() => {
      // router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
    }, 1000)
  // }
}
</script>

<template>
  <div class="fr-grid-row">
    <div class="fr-col-12 fr-col-lg-8">
      <form @submit.prevent="handleNext()">
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
        <DsfrButton class="fr-mt-4w" type="submit" label="Suivant" />
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .fr-col-sm-45 {
    flex: 0 0 45%;
    max-width: 45%;
    width: 45%;
  }

  .justify-between {
    justify-content: space-between;
  }
</style>
