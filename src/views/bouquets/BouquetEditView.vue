<script setup>
import Tooltip from "@/components/Tooltip.vue"
import { ref, onMounted } from "vue"
import { useDatasetStore } from "../../store/DatasetStore"
import { useBouquetStore } from "../../store/BouquetStore"
import { useRouter, useRoute } from "vue-router"
import config from "@/config"

const datasetStore = useDatasetStore()
const bouquetStore = useBouquetStore()
const router = useRouter()
const route = useRoute()

const isCreate = route.name === "bouquet_add"

const form = ref({})
const datasets = ref([])
const selectedDataset = ref({})
const loadedBouquet = ref({})
const isEditDesc = ref(false)
const isFormValidated = ref(false);
const errorMessage = ref();
const steps= ref([
  "Description du bouquet de données", 
  "Informations du bouquet de données", 
  "Composition du bouquet",
  "Récapitulatif"
])
const currentStep = ref(1)

const extrasFromDatasets = () => {
  const extras = {}
  for (const dataset of datasets.value) {
    extras[`${config.universe_name}:${dataset.dataset.id}:description`] = dataset.description
  }
  return extras
}

const onSubmit = async () => {
  let res
  const data = {
    ...form.value,
    datasets: datasets.value.map(d => d.dataset.id),
  }

  if (isCreate) {
    res = await bouquetStore.create({
      ...data,
      tags: [config.universe_name],
      extras: extrasFromDatasets(),
    })
  } else {
    res = await bouquetStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags,
      extras: { ...loadedBouquet.value.extras, ...extrasFromDatasets()},
    })
  }

  isFormValidated.value = true;

  if(res.status && res.status === 400) {
    errorMessage.value = "Merci de bien remplir les champs"
  }
  else {
    setTimeout(() => {
      router.push({ name: "bouquet_detail", params: { bid: res.slug } })
    }, 1000)
  }
  
}

onMounted(() => {
  if (!isCreate) {
    bouquetStore.load(route.params.bid).then(data => {
      loadedBouquet.value = data
      form.value.name = data.name
      form.value.description = data.description
      loadDatasets(data.datasets.map(d => d.id), data)
    })
  }
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <DsfrStepper :steps="steps" :currentStep="currentStep" />

        <div class="fr-mt-4v">
          <DsfrAlert
            v-if="isFormValidated && !errorMessage"
            type="success"
            title="Bouquet créé"
            description="Votre bouquet a bien été créé."
          />
          <DsfrAlert
            v-if="errorMessage"
            type="warning"
            :title="errorMessage"
          />
        </div>

        <form @submit.prevent="onSubmit()">
          <DsfrInput
            class="fr-mt-1w fr-mb-4w"
            v-model="form.name"
            type="text"
            placeholder="Mon bouquet"
            :label-visible="true"
            label="Sujet du bouquet"
          />
          
          <Tooltip
            title="Objectif du bouquet"
            name="tooltip__objectif"
            text="Ajoutez ici l’ensemble des informations nécessaires à la compréhension, l’objectif et l’utilisation du bouquet. N’hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
          />
          <Tooltip
            title="Utilisez du markdown pour mettre en forme votre texte"
            name="tooltip__markdown"
            text="*simple astérisque pour italique*<br/> **double astérisque pour gras**<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
          />
          <DsfrInput
            class="fr-mt-1w fr-mb-2w"
            v-model="form.description"
            placeholder="Ma description"
            :label-visible="true"
            :is-textarea="true"
          />
          
          <DsfrButton class="fr-mt-4w" type="submit" label="Suivant" />
        </form>
      </div>
    </div>
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
