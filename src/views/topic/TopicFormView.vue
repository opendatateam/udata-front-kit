<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref, watch, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import TopicForm from '@/components/forms/topic/TopicForm.vue'
import TopicOwnerForm from '@/components/forms/topic/TopicOwnerForm.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import type { Topic, TopicPostData } from '@/model/topic'
import type { TopicPageRouterConf } from '@/router/utils'
import {
  useRouteMeta,
  useRouteParamsAsString,
  useRouteQueryAsString
} from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { usePageConf } from '@/utils/config'
import { useTagsQuery } from '@/utils/tags'
import { cloneTopic } from '@/utils/topic'

interface Props extends TopicPageRouterConf {
  isCreate: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCreate: true
})

const userStore = useUserStore()
const { canAddTopic } = storeToRefs(userStore)

const router = useRouter()
const meta = useRouteMeta()
const pageConf = usePageConf(meta.pageKey || 'topics')
const routeParams = useRouteParamsAsString().params
const routeQuery = useRouteQueryAsString().query

// populate tags from filters in query string
const { tag: selectedTags } = useTagsQuery(
  meta.pageKey || 'topics',
  routeQuery,
  true
)

const topic: Ref<
  Partial<TopicPostData> & Pick<TopicPostData, 'extras' | 'tags'>
> = ref({
  private: true,
  tags: [config.universe.name, ...selectedTags.filter((v) => !!v)],
  spatial: routeQuery.geozone ? { zones: [routeQuery.geozone] } : undefined,
  extras: {
    [props.extrasKey]: {
      datasets_properties: []
    }
  }
})

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const formFields = ref()
const errorStatus = ref()
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
const sortedinputErrors = computed(() =>
  Array.from(inputErrorMessages.keys()).filter((key) =>
    formErrors.value.includes(key)
  )
)

const errorMsg = ref('')
const canSave = ref(false)

const isReadyForForm = computed(() => {
  const extras = topic.value?.extras?.[props.extrasKey]
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
        name: `${meta.pageKey}_detail`,
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
      .then(() => router.push({ name: meta.pageKey }))
      .catch((error) => {
        errorMsg.value = `Quelque chose s'est mal passé, merci de réessayer. (${error.code})`
      })
  }
}

const cancel = () => {
  if (props.isCreate) {
    if (routeQuery.clone == null) {
      router.push({ name: meta.pageKey })
    } else {
      router.go(-1)
    }
  } else {
    router.push({
      name: `${meta.pageKey}_detail`,
      params: {
        item_id: topic.value.slug
      }
    })
  }
}

const metaTitle = computed(() => {
  if (topic.value.name && routeQuery.clone != null) {
    return `Cloner le ${pageConf.object.singular} ${topic.value.name}`
  } else if (topic.value.name) {
    return `Éditer le ${pageConf.object.singular} ${topic.value.name}`
  }
  return `Ajouter un ${pageConf.object.singular}`
})

onMounted(() => {
  if (!props.isCreate || routeQuery.clone != null) {
    const loader = useLoading().show()
    useTopicStore()
      .load(routeQuery.clone || routeParams.bid)
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
      })
      .finally(() => loader.hide())
  }
})

watch(
  metaTitle,
  () => {
    setAccessibilityProperties(metaTitle.value)
  },
  { immediate: true }
)

const onSubmit = async () => {
  // reset error fields
  formErrors.value = []
  await formFields.value.onSubmit()

  if (formErrors.value.length > 0) {
    errorStatus.value.focus()
  } else if (canSave.value) {
    save()
  }
}
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
        <div
          v-show="formErrors.length"
          class="fr-my-4w fr-p-2w error-status"
          role="group"
          aria-labelledby="error-summary-title"
        >
          <h3 id="error-summary-title" ref="errorStatus" tabindex="-1">
            Il y a {{ sortedinputErrors.length }} erreur<span
              v-if="formErrors.length > 1"
              >s</span
            >
            de saisie dans le formulaire.
          </h3>
          <ol>
            <li
              v-for="(error, index) in sortedinputErrors"
              :key="index"
              class="error"
            >
              <a :href="`#input-${error}`">{{
                inputErrorMessages.get(error)
              }}</a>
            </li>
          </ol>
        </div>
        <fieldset>
          <legend class="fr-fieldset__legend fr-text--lead">
            Description du {{ pageConf.object.extended }}
          </legend>
          <TopicForm
            v-if="isReadyForForm"
            ref="formFields"
            v-model="topic"
            v-model:form-errors="formErrors"
            @update-validation="(isValid: boolean) => (canSave = isValid)"
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
