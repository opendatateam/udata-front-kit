<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CreateBouquetStep1 from "@/components/CreateBouquetStep1.vue"
import CreateBouquetStep2 from "@/components/CreateBouquetStep2.vue"
import Tooltip from '@/components/Tooltip.vue'
// import config from '@/config'
import { useTopicStore } from '@/store/TopicStore'

const topicStore = useTopicStore()
// const router = useRouter()
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
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value += 1;
    console.log("steps.value.length", "steps.value.length")
    console.log("currentStep.value", currentStep.value)
  }
}

// const onSubmit = async () => {
//   let res
//   const data = {
//     ...form.value
//   }
//   if (isCreate) {
//     res = await topicStore.create({
//       ...data,
//       tags: [config.universe.name]
//     })
//   } else {
//     res = await topicStore.update(loadedBouquet.value.id, {
//       ...data,
//       tags: loadedBouquet.value.tags
//     })
//   }

//   isFormValidated.value = true

//   if (res.status && res.status === 400) {
//     errorMessage.value = 'Merci de bien remplir les champs'
//   } else {
//     setTimeout(() => {
//       router.push({ name: 'bouquet_detail', params: { bid: res.slug } })
//     }, 1000)
//   }
// }

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
        <create-bouquet-step1 v-if="currentStep === 1" :nextStep="nextStep" />
        <create-bouquet-step2 v-else :nextStep="nextStep"/>

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
