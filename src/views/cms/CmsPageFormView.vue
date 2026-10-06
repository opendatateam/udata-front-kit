<script lang="ts" setup>
import { toast, type PageBloc } from '@datagouv/components-next'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import PageShow from '@/components/cms/PageShow.vue'
import ErrorMessage from '@/components/forms/ErrorMessage.vue'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsCategoryConfig } from '@/model/config'
import { Availability, type Topic } from '@/model/topic'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { categoryIdFromTags, withCategoryTag } from '@/utils/cms'
import { useSiteId } from '@/utils/config'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const router = useRouter()
const cmsPageStore = useCmsPageStore()
const topicElementStore = useTopicElementStore()

const isCreate = computed(() => !props.id && !route.params.id)
const pageId = computed(
  () => props.id ?? (route.params.id as string | undefined)
)

const page = ref<CmsPage | null>(null)
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const error = ref('')
const forbidden = ref(false)

const name = ref('')
const description = ref('')
const categoryId = ref<string | null>(null)
// a new page always inherits the CMS topic's own owner/organization, so
// anyone who can manage the topic can also manage every page under it
const cmsTopic = ref<Topic | null>(null)
const cmsTopicLoaded = ref(false)
const pageOwnerLabel = computed(() => {
  const topic = cmsTopic.value
  if (!topic) return ''
  if (topic.organization) return `l'organisation ${topic.organization.name}`
  if (topic.owner)
    return `l'utilisateur ${topic.owner.first_name} ${topic.owner.last_name}`
  return ''
})
// only admins can reach this form for a topic with neither — a normal user's
// edit rights always come from matching one of the two
const topicUnowned = computed(() => {
  const topic = cmsTopic.value
  return (
    cmsTopicLoaded.value &&
    topic !== null &&
    !topic.organization &&
    !topic.owner
  )
})
const categories = computed<CmsCategoryConfig[]>(
  () => config.website.cms?.categories ?? []
)
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: c.id, text: c.label }))
)

const errorSummary = ref()
const formErrors: Ref<string[]> = ref([])
const inputErrorMessages = new Map([['name', 'Le titre est obligatoire.']])
const hasError = (field: string) => formErrors.value.includes(field)
const getErrorMessage = (field: string) => inputErrorMessages.get(field) || ''

const validateFields = (): boolean => {
  const errors: string[] = []
  if (!name.value.trim()) errors.push('name')
  formErrors.value = errors
  return errors.length === 0
}

const focusErrorSummary = () => {
  setTimeout(() => {
    errorSummary.value?.$el.focus({ preventScroll: true })
    errorSummary.value?.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 0)
}

// kept separate from `page.blocs` until the single save button is clicked
const draftBlocs = ref<PageBloc[]>([])

// taken after load/save, diffed against current values to warn on unsaved edits
const editSnapshot = () =>
  JSON.stringify({
    name: name.value,
    description: description.value,
    categoryId: categoryId.value,
    blocs: draftBlocs.value
  })
const savedSnapshot = ref('')
const isDirty = computed(
  () =>
    !isCreate.value &&
    page.value !== null &&
    editSnapshot() !== savedSnapshot.value
)
const UNSAVED_CHANGES_WARNING =
  'Des modifications non enregistrées seront perdues. Quitter quand même ?'

onBeforeRouteLeave(() => {
  if (isDirty.value) return window.confirm(UNSAVED_CHANGES_WARNING)
})

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload))
onUnmounted(() =>
  window.removeEventListener('beforeunload', handleBeforeUnload)
)

// full-replace PUT: strip read-only fields the write schema rejects
const toWritablePage = (p: CmsPage) => {
  const {
    id: _id,
    slug: _slug,
    uri: _uri,
    page: _page,
    owner: _owner,
    organization: _organization,
    published: _published,
    created_at: _created_at,
    last_modified: _last_modified,
    permissions: _permissions,
    ...writable
  } = p
  return writable
}

const breadcrumbLinks = computed(() => {
  const base = [
    { to: '/', text: 'Accueil' },
    { to: '/admin/cms', text: 'CMS' }
  ]
  if (isCreate.value) return [...base, { text: 'Nouvelle page' }]
  return [...base, { text: page.value?.name ?? '…' }]
})

const loadPage = async (id: string) => {
  loading.value = true
  page.value = null
  error.value = ''
  formErrors.value = []
  forbidden.value = false
  try {
    const fetched = await cmsPageStore.fetchPageById(id)
    if (!fetched.permissions.edit) {
      forbidden.value = true
      return
    }
    page.value = fetched
    name.value = fetched.name
    description.value = fetched.description ?? ''
    categoryId.value = categoryIdFromTags(fetched.tags)
    draftBlocs.value = [...fetched.blocs]
    savedSnapshot.value = editSnapshot()
  } catch {
    error.value = 'Impossible de charger la page.'
  } finally {
    loading.value = false
  }
}

watch(
  pageId,
  (id) => {
    if (id) loadPage(id)
  },
  { immediate: true }
)

if (isCreate.value) {
  cmsPageStore.loadCmsTopic().then((topic) => {
    cmsTopic.value = topic
    cmsTopicLoaded.value = true
  })
}

const handleCreate = async () => {
  if (topicUnowned.value) return
  if (!validateFields()) {
    focusErrorSummary()
    return
  }
  saving.value = true
  error.value = ''
  let newPage: CmsPage | null = null
  try {
    newPage = await cmsPageStore.createPage({
      name: name.value,
      description: description.value.trim() || null,
      blocs: [],
      tags: withCategoryTag([], categoryId.value),
      ...(cmsTopic.value?.organization
        ? { organization: cmsTopic.value.organization.id }
        : cmsTopic.value?.owner
          ? { owner: cmsTopic.value.owner.id }
          : {})
    })
    // the topic link lives on the topic side (POST /topics/:id/elements/), not on the page
    const topicId = config.website.cms?.topic_id
    if (topicId) {
      await topicElementStore.createElement(topicId, {
        title: newPage.name,
        description: null,
        tags: [],
        element: { class: 'Page', id: newPage.id },
        extras: {
          [useSiteId()]: {
            uri: newPage.page,
            availability: Availability.LOCAL_AVAILABLE
          }
        }
      })
    }
  } catch {
    // topic link failed — roll back so a retry doesn't leave an orphaned duplicate
    if (newPage) {
      try {
        await cmsPageStore.deletePage(newPage.id)
        error.value = 'Erreur lors de la création.'
      } catch {
        error.value = `La page a été créée (id ${newPage.id}) mais n'a pas pu être liée au site. Contactez un administrateur.`
      }
    } else {
      error.value = 'Erreur lors de la création.'
    }
    saving.value = false
    return
  }
  try {
    await router.push(`/admin/cms/edit/${newPage.id}`)
  } finally {
    saving.value = false
  }
}

const handleSave = async () => {
  if (!page.value) return
  if (!validateFields()) {
    focusErrorSummary()
    return
  }
  saving.value = true
  error.value = ''
  try {
    const updated = await cmsPageStore.updatePage(page.value.id, {
      ...toWritablePage(page.value),
      name: name.value,
      description: description.value.trim() || null,
      tags: withCategoryTag(page.value.tags, categoryId.value),
      blocs: draftBlocs.value
    })
    page.value = { ...page.value, ...updated }
    draftBlocs.value = [...updated.blocs]
    savedSnapshot.value = editSnapshot()
    toast.success('Page enregistrée.')
  } catch {
    error.value = 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

const togglePublish = async () => {
  if (!page.value) return
  publishing.value = true
  try {
    if (page.value.published) {
      await cmsPageStore.unpublishPage(page.value.id)
      page.value = { ...page.value, published: null }
    } else {
      page.value = {
        ...page.value,
        ...(await cmsPageStore.publishPage(page.value.id))
      }
    }
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--middle justify-between">
      <div class="fr-col">
        <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
      </div>
      <div
        v-if="!isCreate && page"
        class="fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
      >
        <span v-if="page.published" class="fr-badge fr-badge--success"
          >Publié</span
        >
        <span v-else class="fr-badge fr-badge--new fr-badge--no-icon"
          >Brouillon</span
        >
        <RouterLink
          :to="`/admin/cms/view/${page.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line fr-btn--icon-left"
        >
          Aperçu
        </RouterLink>
        <button
          type="button"
          class="fr-btn fr-btn--sm"
          :class="page.published ? 'fr-btn--secondary' : ''"
          :disabled="publishing"
          @click="togglePublish"
        >
          {{ publishing ? '…' : page.published ? 'Dépublier' : 'Publier' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="loading" class="fr-container fr-py-6w">
    <p>Chargement…</p>
  </div>

  <div v-else-if="forbidden" class="fr-container fr-py-4w">
    <div class="fr-alert fr-alert--error">
      <p>Vous n'avez pas les droits pour modifier cette page.</p>
    </div>
  </div>

  <template v-else-if="isCreate">
    <GenericContainer>
      <h1 class="fr-col-auto fr-mb-2v">Nouvelle page</h1>

      <div v-if="error" class="fr-alert fr-alert--error fr-mb-3w">
        <p>{{ error }}</p>
      </div>

      <div v-if="topicUnowned" class="fr-alert fr-alert--error fr-mb-3w">
        <p>
          Le topic CMS n'a ni propriétaire ni organisation. Impossible de créer
          une page tant que ce n'est pas corrigé.
        </p>
      </div>

      <div v-if="pageOwnerLabel" class="fr-alert fr-alert--info fr-mb-3w">
        <p>Cette page appartiendra à {{ pageOwnerLabel }}.</p>
      </div>

      <form @submit.prevent="handleCreate">
        <ErrorSummary
          v-show="formErrors.length"
          ref="errorSummary"
          :form-error-messages-map="inputErrorMessages"
          :form-errors="formErrors"
          heading-level="h3"
        />
        <fieldset>
          <legend class="fr-fieldset__legend fr-text--lead">
            Informations de la page
          </legend>
          <div class="fr-mb-3w">
            <label for="input-name" class="fr-label">
              Titre (obligatoire)
            </label>
            <input
              id="input-name"
              v-model="name"
              type="text"
              class="fr-input"
              :aria-invalid="hasError('name') ? true : undefined"
              :aria-errormessage="hasError('name') ? 'errors-name' : undefined"
            />
            <ErrorMessage
              v-if="hasError('name')"
              input-name="name"
              :error-message="getErrorMessage('name')"
            />
          </div>
          <div class="fr-mb-3w">
            <label for="page-description" class="fr-label">
              Description (facultatif)
              <span class="fr-hint-text"
                >Utilisée comme description pour le référencement (SEO).</span
              >
            </label>
            <textarea
              id="page-description"
              v-model="description"
              class="fr-input"
              rows="3"
            />
          </div>
          <div v-if="categories.length" class="fr-mb-3w">
            <DsfrSelect
              id="page-category"
              v-model="categoryId"
              label="Catégorie (facultatif)"
              hint="Détermine le préfixe d'URL de la page. Sans catégorie, la page est une page statique dont la route est définie dans la configuration du site."
              default-unselected-text="Aucune (page statique)"
              :options="categoryOptions"
            />
          </div>
        </fieldset>
        <div class="fr-mt-4w">
          <button
            type="submit"
            class="fr-btn"
            :disabled="saving || topicUnowned"
          >
            {{ saving ? 'Création en cours…' : 'Créer la page' }}
          </button>
        </div>
      </form>
    </GenericContainer>
  </template>

  <template v-else-if="page">
    <GenericContainer>
      <h1 class="fr-col-auto fr-mb-2v">{{ page.name }}</h1>
    </GenericContainer>
    <div v-if="error" class="fr-container fr-py-1w">
      <div class="fr-alert fr-alert--error">
        <p>{{ error }}</p>
      </div>
    </div>
    <form @submit.prevent="handleSave">
      <GenericContainer>
        <ErrorSummary
          v-show="formErrors.length"
          ref="errorSummary"
          :form-error-messages-map="inputErrorMessages"
          :form-errors="formErrors"
          heading-level="h3"
        />
        <fieldset>
          <legend class="fr-fieldset__legend fr-text--lead">
            Informations de la page
          </legend>
          <div class="fr-mb-3w">
            <label for="input-name" class="fr-label">
              Titre (obligatoire)
            </label>
            <input
              id="input-name"
              v-model="name"
              type="text"
              class="fr-input"
              :aria-invalid="hasError('name') ? true : undefined"
              :aria-errormessage="hasError('name') ? 'errors-name' : undefined"
            />
            <ErrorMessage
              v-if="hasError('name')"
              input-name="name"
              :error-message="getErrorMessage('name')"
            />
          </div>
          <div class="fr-mb-3w">
            <label for="page-description" class="fr-label">
              Description (facultatif)
              <span class="fr-hint-text"
                >Utilisée comme description pour le référencement (SEO).</span
              >
            </label>
            <textarea
              id="page-description"
              v-model="description"
              class="fr-input"
              rows="3"
            />
          </div>
          <div v-if="categories.length" class="fr-mb-3w">
            <DsfrSelect
              id="page-category"
              v-model="categoryId"
              label="Catégorie (facultatif)"
              hint="Détermine le préfixe d'URL de la page. Sans catégorie, la page est une page statique dont la route est définie dans la configuration du site."
              default-unselected-text="Aucune (page statique)"
              :options="categoryOptions"
            />
          </div>
        </fieldset>
      </GenericContainer>
      <fieldset>
        <legend class="content-legend fr-fieldset__legend fr-text--lead">
          <div class="fr-container">Contenu de la page</div>
        </legend>
        <PageShow v-model:blocs="draftBlocs" :edit="true" />
      </fieldset>
      <GenericContainer>
        <button type="submit" class="fr-btn" :disabled="saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </GenericContainer>
    </form>
  </template>

  <div v-else class="fr-container fr-py-4w">
    <p>{{ error || 'Page introuvable.' }}</p>
  </div>
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
.content-legend {
  display: block;
  width: 100%;
  margin-bottom: -0.5rem;
}
</style>
