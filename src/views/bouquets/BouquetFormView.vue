<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import BouquetForm from '@/components/forms/bouquet/BouquetForm.vue'
import BouquetOwnerForm from '@/components/forms/bouquet/BouquetOwnerForm.vue'
import config from '@/config'
import { NoOptionSelected } from '@/model/theme'
import type { TopicPostData } from '@/model/topic'
import { useRouteParamsAsString, useRouteQueryAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { cloneTopic } from '@/utils/bouquet'
import { useTopicsConf } from '@/utils/config'

const props = defineProps({
  isCreate: {
    type: Boolean,
    default: true
  }
})

const userStore = useUserStore()
const { canAddBouquet } = storeToRefs(userStore)

const router = useRouter()
const routeParams = useRouteParamsAsString().params
const routeQuery = useRouteQueryAsString().query
const { topicsName, topicsSlug, topicsExtrasKey } = useTopicsConf()
const topic: Ref<Partial<TopicPostData>> = ref({
  private: true,
  tags: [config.universe.name],
  spatial: routeQuery.geozone ? { zones: [routeQuery.geozone] } : undefined,
  extras: {
    [topicsExtrasKey]: {
      theme: routeQuery.theme || NoOptionSelected,
      subtheme: routeQuery.subtheme || NoOptionSelected,
      datasets_properties: []
    }
  }
})
const errorMsg = ref('')
const canSave = ref(false)

const isReadyForForm = computed(() => {
  const extras = topic.value?.extras?.[topicsExtrasKey]
  // condition for form mouting based on topic data load: edit || create raw || create cloned
  return (
    topic.value.id ||
    (props.isCreate && !routeQuery.clone) ||
    (routeQuery.clone && extras?.cloned_from)
  )
})

const handleTopicOperation = (operation: (...args: any[]) => Promise<any>) => {
  const loader = useLoading().show()
  operation()
    .then((response) => {
      router.push({
        name: `${topicsSlug}_detail`,
        params: { bid: response.slug }
      })
    })
    .catch((error) => {
      errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
    })
    .finally(() => loader.hide())
}

const createTopic = () => {
  handleTopicOperation(() => useTopicStore().create(topic.value))
}

const updateTopic = () => {
  if (topic.value.id === undefined) {
    throw Error('Trying to update topic without topic id')
  }
  handleTopicOperation(() =>
    useTopicStore().update(topic.value.id as string, topic.value)
  )
}

const save = () => {
  if (props.isCreate) {
    createTopic()
  } else {
    updateTopic()
  }
}

const destroy = async () => {
  if (topic.value?.id === undefined) {
    throw Error('Trying to delete topic without topic id')
  }
  if (window.confirm(`Etes-vous sûr de vouloir supprimer ce ${topicsName} ?`)) {
    useTopicStore()
      .delete(topic.value.id)
      .then(() => router.push({ name: topicsSlug }))
      .catch((error) => {
        errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
      })
  }
}

const cancel = () => {
  if (props.isCreate) {
    if (routeQuery.clone == null) {
      router.push({ name: topicsSlug })
    } else {
      router.go(-1)
    }
  } else {
    router.push({
      name: `${topicsSlug}_detail`,
      params: {
        bid: topic.value.slug
      }
    })
  }
}

onMounted(() => {
  if (!props.isCreate || routeQuery.clone != null) {
    const loader = useLoading().show()
    useTopicStore()
      .load(routeQuery.clone || routeParams.bid)
      .then((remoteTopic) => {
        if (routeQuery.clone != null) {
          topic.value = cloneTopic(remoteTopic)
        } else {
          // remove rels from TopicV2 for TopicPostData compatibility
          const { datasets, reuses, ...data } = remoteTopic
          topic.value = data
        }
      })
      .finally(() => loader.hide())
  }
})
</script>

<template>
  <GenericContainer class="fr-mt-4w">
    <div v-if="canAddBouquet">
      <form>
        <div class="fr-mt-4v">
          <DsfrAlert v-if="errorMsg" type="warning" :title="errorMsg" />
        </div>
        <div
          class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
        >
          <h1 class="fr-col-auto fr-mb-2v">
            {{ isCreate ? `Nouveau ${topicsName}` : topic.name }}
          </h1>
          <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
            <DsfrButton
              v-if="!isCreate"
              secondary
              class="fr-mb-1w"
              label="Supprimer"
              icon="ri-delete-bin-line"
              @click.prevent="destroy"
            />
            <DsfrButton
              secondary
              class="fr-mb-1w fr-ml-1w"
              label="Annuler"
              @click.prevent="cancel"
            />
            <DsfrButton
              :disabled="!canSave"
              class="fr-mb-1w fr-ml-1w"
              label="Enregistrer"
              @click.prevent="save"
            />
          </div>
        </div>
        <div class="fr-mt-4w">
          <h2>Description du {{ topicsName }} de données</h2>
          <BouquetForm
            v-if="isReadyForForm"
            v-model="topic"
            @update-validation="(isValid: boolean) => canSave = isValid"
          />
        </div>
        <div class="fr-mt-4w">
          <h2>Propriétaire du {{ topicsName }}</h2>
          <BouquetOwnerForm v-if="isReadyForForm" v-model="topic" />
        </div>
        <div class="fr-mt-4w fr-grid-row fr-grid-row--right">
          <DsfrButton
            v-if="!isCreate"
            secondary
            class="fr-mb-1w"
            label="Supprimer"
            icon="ri-delete-bin-line"
            @click.prevent="destroy"
          />
          <DsfrButton
            secondary
            class="fr-mb-1w fr-ml-1w"
            label="Annuler"
            @click.prevent="cancel"
          />
          <DsfrButton
            :disabled="!canSave"
            class="fr-mb-1w fr-ml-1w"
            label="Enregistrer"
            @click.prevent="save"
          />
        </div>
      </form>
    </div>
    <div v-else>
      Vous n'avez pas les droits pour ajouter un {{ topicsName }}.
    </div>
  </GenericContainer>
</template>
