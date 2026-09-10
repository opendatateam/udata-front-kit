<script lang="ts" setup>
import type { PageBloc, Post } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import PageShow from '@/components/cms/PageShow.vue'
import config from '@/config'
import { usePostStore } from '@/store/PostStore'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

const isCreate = computed(() => !props.id && !route.params.id)
const postId = computed(
  () => props.id ?? (route.params.id as string | undefined)
)

const post = ref<Post | null>(null)
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const error = ref('')

const name = ref('')
const headline = ref('')

// Stable reference so PageShow's watch on `blocs` doesn't fire (and discard
// in-progress edits) on unrelated re-renders when post.blocs is nullish.
const blocs = computed(() => post.value?.blocs ?? [])

// Post updates are a full-replace PUT: strip read-only/reference fields so we
// don't send back nested objects (owner, datasets, reuses) the write schema rejects.
const toWritablePost = (p: Post) => {
  const {
    id: _id,
    slug: _slug,
    url: _url,
    owner: _owner,
    datasets: _datasets,
    reuses: _reuses,
    created_at: _created_at,
    last_modified: _last_modified,
    published: _published,
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
  return [...base, { text: post.value?.name ?? '…' }]
})

const loadPost = async (id: string) => {
  loading.value = true
  post.value = null
  error.value = ''
  try {
    post.value = await postStore.fetchPostById(id)
    name.value = post.value.name
    headline.value = post.value.headline || ''
  } catch {
    error.value = 'Impossible de charger la page.'
  } finally {
    loading.value = false
  }
}

watch(
  postId,
  (id) => {
    if (id) loadPost(id)
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
    const newPost = await postStore.createPost({
      name: name.value,
      headline: headline.value,
      kind: 'page',
      body_type: 'blocs',
      blocs: [],
      tags: config.website.cms?.site_tag ? [config.website.cms.site_tag] : []
    })
    await router.push(`/admin/cms/edit/${newPost.id}`)
  } catch {
    error.value = 'Erreur lors de la création.'
  } finally {
    saving.value = false
  }
}

const savingMeta = ref(false)

const handleSaveMeta = async () => {
  if (!post.value) return
  if (!name.value.trim()) {
    error.value = 'Le titre est obligatoire.'
    return
  }
  savingMeta.value = true
  error.value = ''
  try {
    const currentBlocs = post.value.blocs
    const updated = await postStore.updatePost(post.value.id, {
      ...toWritablePost(post.value),
      name: name.value,
      headline: headline.value
    })
    // Keep the bloc editor's array reference stable so its watcher doesn't
    // discard in-progress, unsaved bloc edits on an unrelated metadata save.
    post.value = { ...updated, blocs: currentBlocs }
  } catch {
    error.value = 'Erreur lors de la sauvegarde.'
  } finally {
    savingMeta.value = false
  }
}

const handleSave = async (updatedBlocs: PageBloc[]) => {
  if (!post.value) return
  saving.value = true
  try {
    post.value = await postStore.updatePost(post.value.id, {
      ...toWritablePost(post.value),
      blocs: updatedBlocs
    })
  } finally {
    saving.value = false
  }
}

const togglePublish = async () => {
  if (!post.value) return
  publishing.value = true
  try {
    if (post.value.published) {
      await postStore.unpublishPost(post.value.id)
      post.value = { ...post.value, published: null }
    } else {
      const updated = await postStore.publishPost(post.value.id)
      post.value = updated
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
        v-if="!isCreate && post"
        class="fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
      >
        <span v-if="post.published" class="fr-badge fr-badge--success"
          >Publié</span
        >
        <span v-else class="fr-badge fr-badge--new">Brouillon</span>
        <RouterLink
          :to="`/admin/cms/view/${post.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line fr-btn--icon-left"
        >
          Aperçu
        </RouterLink>
        <button
          type="button"
          class="fr-btn fr-btn--sm"
          :class="post.published ? 'fr-btn--secondary' : ''"
          :disabled="publishing"
          @click="togglePublish"
        >
          {{ publishing ? '…' : post.published ? 'Dépublier' : 'Publier' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="loading" class="fr-container fr-py-6w">
    <p>Chargement…</p>
  </div>

  <template v-else-if="isCreate">
    <GenericContainer>
      <h1 class="fr-h2">Nouvelle page</h1>

      <div v-if="error" class="fr-alert fr-alert--error fr-mb-3w">
        <p>{{ error }}</p>
      </div>

      <form @submit.prevent="handleCreate">
        <div class="fr-mb-3w">
          <label for="post-name" class="fr-label">
            Titre <span class="fr-hint-text">Obligatoire</span>
          </label>
          <input
            id="post-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
          />
        </div>
        <div class="fr-mb-3w">
          <label for="post-headline" class="fr-label">Sous-titre</label>
          <input
            id="post-headline"
            v-model="headline"
            type="text"
            class="fr-input"
          />
        </div>
        <button type="submit" class="fr-btn" :disabled="saving">
          {{ saving ? 'Création en cours…' : 'Créer la page' }}
        </button>
      </form>
    </GenericContainer>
  </template>

  <template v-else-if="post">
    <div v-if="error" class="fr-container fr-py-1w">
      <div class="fr-alert fr-alert--error">
        <p>{{ error }}</p>
      </div>
    </div>
    <GenericContainer>
      <form @submit.prevent="handleSaveMeta">
        <div class="fr-mb-3w">
          <label for="post-name" class="fr-label">
            Titre <span class="fr-hint-text">Obligatoire</span>
          </label>
          <input
            id="post-name"
            v-model="name"
            type="text"
            class="fr-input"
            required
          />
        </div>
        <div class="fr-mb-3w">
          <label for="post-headline" class="fr-label">Sous-titre</label>
          <input
            id="post-headline"
            v-model="headline"
            type="text"
            class="fr-input"
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
    <PageShow
      v-if="post.body_type === 'blocs'"
      :blocs="blocs"
      :edit="true"
      @save="handleSave"
    />
  </template>

  <div v-else class="fr-container fr-py-4w">
    <p>{{ error || 'Page introuvable.' }}</p>
  </div>
</template>
