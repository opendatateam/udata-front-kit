<script setup>
import Tooltip from "@/components/Tooltip.vue"
import { ref } from "vue"
import { useTopicStore } from '@/store/TopicStore'
import { useRoute } from "vue-router"
import config from "@/config"

const topicStore = useTopicStore()
const route = useRoute()

const isCreate = route.name === "bouquet_add"

const form = ref({})
const loadedBouquet = ref({})
const isFormValidated = ref(false);
const errorMessage = ref();

const props = defineProps({
  nextStep: Function
});

const onSubmit = async () => {
  let res
  const data = {
    ...form.value
  }

  if (isCreate) {
    res = await topicStore.create({
      ...data,
      tags: [config.universe.name]
    })
  } else {
    res = await topicStore.update(loadedBouquet.value.id, {
      ...data,
      tags: loadedBouquet.value.tags
    })
  }
  
  isFormValidated.value = true;

  if(res.status && res.status === 400) {
    errorMessage.value = "Merci de bien remplir les champs"
  }
  else {
    props.nextStep();
    // setTimeout(() => {
    //   router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
    // }, 1000)
  }
}
</script>

<template>
  <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
      <h1 v-if="!isCreate">Modifier le bouquet {{ loadedBouquet.name }}</h1>

      <div class="fr-mt-4v">
        <DsfrAlert
          v-if="isFormValidated && !errorMessage"
          type="success"
          title="Bouquet créé"
          description="Votre bouquet a bien été créé."
        />
        <DsfrAlert v-if="errorMessage" type="warning" :title="errorMessage" />
      </div>

      <form @submit.prevent="onSubmit()">
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
          class="fr-mt-1w fr-mb-2w"
          placeholder="Ma description"
          :label-visible="true"
          :is-textarea="true"
        />

        <DsfrButton class="fr-mt-4w" type="submit" label="Suivant" />
      </form>
    </div>
  </div>
</template>