<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import TopicForm from '@/components/forms/topic/TopicForm.vue'
import TopicOwnerForm from '@/components/forms/topic/TopicOwnerForm.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import type { Topic, TopicPostData } from '@/model/topic'
import type { TopicPageRouterConf } from '@/router/model'
import {
  useCurrentPageConf,
  useRouteParamsAsString,
  useRouteQueryAsString
} from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useSiteId } from '@/utils/config'
import { useTagsQuery } from '@/utils/tags'
import { cloneTopic } from '@/utils/topic'
import { useUniverseQuery } from '@/utils/universe'

interface Props extends TopicPageRouterConf {
  isCreate: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCreate: true
})

const userStore = useUserStore()
const { canAddTopic } = storeToRefs(userStore)

const router = useRouter()
const { pageKey, pageConf } = useCurrentPageConf()
const routeParams = useRouteParamsAsString().params
const routeQuery = useRouteQueryAsString().query

// populate tags from filters in query string
const { tag: selectedTags } = useTagsQuery(
  pageKey || 'topics',
  routeQuery,
  true
)
const { tagsWithUniverse } = useUniverseQuery(pageKey, selectedTags)

const topic: Ref<
  Partial<TopicPostData> & Pick<TopicPostData, 'extras' | 'tags'>
> = ref({
  private: true,
  tags: tagsWithUniverse,
  spatial: routeQuery.geozone ? { zones: [routeQuery.geozone] } : undefined,
  extras: {
    [useSiteId()]: {
      datasets_properties: []
    }
  }
})

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const formFields = ref()
const errorSummary = ref()
const formErrors: Ref<string[]> = ref([])
// define error messages for form fields
const filtersMessages = pageConf.filters
  .filter((f) => f.form != null)
  .map((f): [string, string] => [f.id, `Le champ "${f.name}" est obligatoire.`])
const inputErrorMessages = new Map([
  ['name', 'Veuillez renseigner un sujet.'],
  ['description', 'La description ne doit pas être vide.'],
  ...filtersMessages
])
// Filter out valid ipnuts. Needed to reorder the received input errors to match the form order
const sortedErrors = computed(() =>
  Array.from(inputErrorMessages.keys()).filter((key) =>
    formErrors.value.includes(key)
  )
)

const errorMsg = ref('')

const isReadyForForm = computed(() => {
  const extras = topic.value?.extras?.[useSiteId()]
  // condition for form mouting based on topic data load: edit || create raw || create cloned
  return (
    topic.value.id ||
    (props.isCreate && !routeQuery.clone) ||
    (routeQuery.clone && extras?.cloned_from)
  )
})

const handleTopicOperation = (
  operation: (...args: unknown[]) => Promise<Topic>
) => {
  const loader = useLoading().show()
  operation()
    .then((response) => {
      router.push({
        name: `${pageKey}_detail`,
        params: { item_id: response.slug }
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
  if (
    window.confirm(
      `Etes-vous sûr de vouloir supprimer ce ${pageConf.object.plural} ?`
    )
  ) {
    useTopicStore()
      .delete(topic.value.id)
      .then(() => router.push({ name: pageKey }))
      .catch((error) => {
        errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
      })
  }
}

const cancel = () => {
  if (props.isCreate) {
    if (routeQuery.clone == null) {
      router.push({ name: pageKey })
    } else {
      router.go(-1)
    }
  } else {
    router.push({
      name: `${pageKey}_detail`,
      params: {
        item_id: topic.value.slug
      }
    })
  }
}

const onSubmit = async () => {
  await formFields.value.onSubmit()
  if (formErrors.value.length > 0) {
    setTimeout(() => {
      errorSummary.value.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      errorSummary.value.$el.focus()
    }, 0)
  } else {
    save()
  }
}

const setMetaTitle = () => {
  let metaTitle
  if (props.isCreate && routeQuery.clone != null) {
    metaTitle = `Cloner le ${pageConf.object.singular} ${topic.value.name}`
  } else if (!props.isCreate) {
    metaTitle = `Éditer le ${pageConf.object.singular} ${topic.value.name}`
  } else {
    metaTitle = `Ajouter un ${pageConf.object.singular}`
  }
  setAccessibilityProperties(metaTitle)
}

onMounted(() => {
  if (!props.isCreate || routeQuery.clone != null) {
    const loader = useLoading().show()
    useTopicStore()
      .load(routeQuery.clone || routeParams.item_id)
      .then((remoteTopic) => {
        if (routeQuery.clone != null) {
          topic.value = cloneTopic(
            remoteTopic,
            routeQuery['keep-datasets'] === '1'
          )
        } else {
          // remove rels from TopicV2 for TopicPostData compatibility
          const { datasets, reuses, ...data } = remoteTopic
          topic.value = data
        }
        setMetaTitle()
      })
      .finally(() => loader.hide())
  }
})
</script>

<template>
  <GenericContainer class="fr-mt-4w">
    <div v-if="canAddTopic">
      <div v-if="errorMsg" class="fr-mt-4v">
        <DsfrAlert type="warning" :title="errorMsg" />
      </div>
      <h1 class="fr-col-auto fr-mb-2v">
        {{ isCreate ? `Nouveau ${pageConf.object.singular}` : topic.name }}
      </h1>
      <form novalidate @submit.prevent>
        <ErrorSummary
          v-show="formErrors.length"
          ref="errorSummary"
          :form-error-messages-map="inputErrorMessages"
          :form-errors="sortedErrors"
          heading-level="h3"
        />
        <fieldset>
          <legend class="fr-fieldset__legend fr-text--lead">
            Description du {{ pageConf.object.extended }}
          </legend>
          <TopicForm
            v-if="isReadyForForm"
            ref="formFields"
            v-model="topic"
            v-model:form-errors="formErrors"
            :form-error-messages-map="inputErrorMessages"
          />
        </fieldset>
        <fieldset v-if="isCreate">
          <legend class="fr-fieldset__legend fr-text--lead">
            Propriétaire du {{ pageConf.object.extended }}
          </legend>
          <TopicOwnerForm v-if="isReadyForForm" v-model="topic" />
        </fieldset>
        <div class="fr-mt-4w fr-grid-row fr-grid-row--right">
          <DsfrButton
            v-if="!isCreate"
            type="button"
            secondary
            class="fr-mb-1w"
            label="Supprimer"
            icon="fr-icon-delete-bin-line"
            @click.prevent="destroy"
          />
          <DsfrButton
            type="button"
            secondary
            class="fr-mb-1w fr-ml-1w"
            label="Annuler"
            @click.prevent="cancel"
          />
          <DsfrButton
            type="button"
            class="fr-mb-1w fr-ml-1w"
            label="Enregistrer"
            @click.prevent="onSubmit"
          />
        </div>
      </form>
    </div>
    <div v-else>
      Vous n'avez pas les droits pour ajouter un {{ pageConf.object.singular }}.
    </div>
  </GenericContainer>
</template>

<style scoped>
fieldset,
:deep(fieldset:not(fieldset fieldset)) {
  padding: 0;
  margin: 2rem 0 0;
  border: none;
}
fieldset legend {
  padding: 0;
  margin-inline: 0;
}
</style>
