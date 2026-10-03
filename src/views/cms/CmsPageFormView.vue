<script lang="ts" setup>
import type { PageBloc } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import PageShow from '@/components/cms/PageShow.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsCategoryConfig } from '@/model/config'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { categoryIdFromTags, withCategoryTag } from '@/utils/cms'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const router = useRouter()
const cmsPageStore = useCmsPageStore()

const isCreate = computed(() => !props.id && !route.params.id)
const pageId = computed(
  () => props.id ?? (route.params.id as string | undefined)
)

const page = ref<CmsPage | null>(null)
const loading = ref(false)
const saving = ref(false)
const togglingPrivate = ref(false)
const error = ref('')
const forbidden = ref(false)

const name = ref('')
const categoryId = ref<string | null>(null)
const categories = computed<CmsCategoryConfig[]>(
  () => config.website.cms?.categories ?? []
)
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: c.id, text: c.label }))
)

// Stable reference so PageShow's watch on `blocs` doesn't fire (and discard
// in-progress edits) on unrelated re-renders when page.blocs is nullish.
const blocs = computed(() => page.value?.blocs ?? [])

// Page updates are a full-replace PUT: strip read-only fields (owner/organization/topic
// are set at creation and rejected on update) so we don't send back nested
// objects the write schema rejects.
const toWritablePage = (p: CmsPage) => {
  const {
    id: _id,
    slug: _slug,
    uri: _uri,
    page: _page,
    owner: _owner,
    organization: _organization,
    topic: _topic,
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
    categoryId.value = categoryIdFromTags(fetched.tags)
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
      blocs: [],
      private: true,
      tags: withCategoryTag([], categoryId.value),
      ...(config.website.cms?.topic_id
        ? { topic: config.website.cms.topic_id }
        : {})
    })
    await router.push(`/admin/cms/edit/${newPage.id}`)
  } catch {
    error.value = 'Erreur lors de la création.'
  } finally {
    saving.value = false
  }
}

const savingMeta = ref(false)

const handleSaveMeta = async () => {
  if (!page.value) return
  if (!name.value.trim()) {
    error.value = 'Le titre est obligatoire.'
    return
  }
  savingMeta.value = true
  error.value = ''
  try {
    const currentBlocs = page.value.blocs
    const updated = await cmsPageStore.updatePage(page.value.id, {
      ...toWritablePage(page.value),
      name: name.value,
      tags: withCategoryTag(page.value.tags, categoryId.value)
    })
    // Keep the bloc editor's array reference stable so its watcher doesn't
    // discard in-progress, unsaved bloc edits on an unrelated metadata save.
    page.value = { ...page.value, ...updated, blocs: currentBlocs }
  } catch {
    error.value = 'Erreur lors de la sauvegarde.'
  } finally {
    savingMeta.value = false
  }
}

const handleSave = async (updatedBlocs: PageBloc[]) => {
  if (!page.value) return
  saving.value = true
  try {
    page.value = {
      ...page.value,
      ...(await cmsPageStore.updatePage(page.value.id, {
        ...toWritablePage(page.value),
        blocs: updatedBlocs
      }))
    }
  } finally {
    saving.value = false
  }
}

const togglePrivate = async () => {
  if (!page.value) return
  togglingPrivate.value = true
  try {
    page.value = {
      ...page.value,
      ...(await cmsPageStore.updatePage(page.value.id, {
        ...toWritablePage(page.value),
        private: !page.value.private
      }))
    }
  } finally {
    togglingPrivate.value = false
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
        <span v-if="!page.private" class="fr-badge fr-badge--success"
          >Public</span
        >
        <span v-else class="fr-badge fr-badge--new">Privé</span>
        <RouterLink
          :to="`/admin/cms/view/${page.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line fr-btn--icon-left"
        >
          Aperçu
        </RouterLink>
        <button
          type="button"
          class="fr-btn fr-btn--sm"
          :class="!page.private ? 'fr-btn--secondary' : ''"
          :disabled="togglingPrivate"
          @click="togglePrivate"
        >
          {{
            togglingPrivate
              ? '…'
              : page.private
                ? 'Rendre publique'
                : 'Rendre privée'
          }}
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
          <label for="page-name" class="fr-label">
            Titre <span class="fr-hint-text">Obligatoire</span>
          </label>
          <input
            id="page-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
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
    <GenericContainer>
      <form @submit.prevent="handleSaveMeta">
        <div class="fr-mb-3w">
          <label for="page-name" class="fr-label">
            Titre <span class="fr-hint-text">Obligatoire</span>
          </label>
          <input
            id="page-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
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
        <button
          type="submit"
          class="fr-btn fr-btn--secondary fr-btn--sm"
          :disabled="savingMeta"
        >
          {{ savingMeta ? 'Sauvegarde…' : 'Enregistrer les métadonnées' }}
        </button>
      </form>
    </GenericContainer>
    <PageShow :blocs="blocs" :edit="true" @save="handleSave" />
  </template>

  <div v-else class="fr-container fr-py-4w">
    <p>{{ error || 'Page introuvable.' }}</p>
  </div>
</template>
