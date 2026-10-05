<script lang="ts" setup>
import { toast, type PageBloc } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import PageShow from '@/components/cms/PageShow.vue'
import CmsPageOwnerForm from '@/components/forms/cms/CmsPageOwnerForm.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsCategoryConfig } from '@/model/config'
import { Availability } from '@/model/topic'
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
const ownerDraft = ref<Partial<CmsPage>>({})
const categoryId = ref<string | null>(null)
const categories = computed<CmsCategoryConfig[]>(
  () => config.website.cms?.categories ?? []
)
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: c.id, text: c.label }))
)

// Draft kept separate from `page.blocs` until the single save button is
// clicked, same as the other metadata fields below.
const draftBlocs = ref<PageBloc[]>([])

// Page updates are a full-replace PUT: strip read-only fields (owner/organization
// are set at creation and rejected on update, published only changes via the publish
// endpoints) so we don't send back nested objects the write schema rejects.
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

const handleCreate = async () => {
  if (!name.value.trim()) {
    error.value = 'Le titre est obligatoire.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const newPage = await cmsPageStore.createPage({
      name: name.value,
      description: description.value.trim() || null,
      blocs: [],
      tags: withCategoryTag([], categoryId.value),
      ...(ownerDraft.value.organization
        ? { organization: ownerDraft.value.organization.id }
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
    await router.push(`/admin/cms/edit/${newPage.id}`)
  } catch {
    error.value = 'Erreur lors de la création.'
  } finally {
    saving.value = false
  }
}

const handleSave = async () => {
  if (!page.value) return
  if (!name.value.trim()) {
    error.value = 'Le titre est obligatoire.'
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
      <h1 class="fr-h2">Nouvelle page</h1>

      <div v-if="error" class="fr-alert fr-alert--error fr-mb-3w">
        <p>{{ error }}</p>
      </div>

      <form @submit.prevent="handleCreate">
        <div class="fr-mb-3w">
          <label for="page-name" class="fr-label"> Titre (obligatoire) </label>
          <input
            id="page-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
          />
        </div>
        <div class="fr-mb-3w">
          <label for="page-description" class="fr-label">
            Description
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
            label="Catégorie"
            default-unselected-text="Aucune (page fixe)"
            :options="categoryOptions"
          />
        </div>
        <div class="fr-mb-3w">
          <CmsPageOwnerForm v-model="ownerDraft" />
        </div>
        <button type="submit" class="fr-btn" :disabled="saving">
          {{ saving ? 'Création en cours…' : 'Créer la page' }}
        </button>
      </form>
    </GenericContainer>
  </template>

  <template v-else-if="page">
    <div v-if="error" class="fr-container fr-py-1w">
      <div class="fr-alert fr-alert--error">
        <p>{{ error }}</p>
      </div>
    </div>
    <form @submit.prevent="handleSave">
      <GenericContainer>
        <div class="fr-mb-3w">
          <label for="page-name" class="fr-label"> Titre (obligatoire) </label>
          <input
            id="page-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
          />
        </div>
        <div class="fr-mb-3w">
          <label for="page-description" class="fr-label">
            Description
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
            label="Catégorie"
            default-unselected-text="Aucune (page fixe)"
            :options="categoryOptions"
          />
        </div>
      </GenericContainer>
      <PageShow v-model:blocs="draftBlocs" :edit="true" />
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
