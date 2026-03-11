<script lang="ts" setup>
import type { Page, Post } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

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
const page = ref<Page | null>(null)
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const error = ref('')

// Form fields for create mode
const name = ref('')
const headline = ref('')

const loadPost = async (id: string) => {
  loading.value = true
  post.value = null
  page.value = null
  error.value = ''
  try {
    post.value = await postStore.fetchPostById(id)
    if (post.value.content_as_page) {
      page.value = await postStore.fetchPage(post.value.content_as_page.id)
    }
  } catch {
    error.value = 'Impossible de charger la page.'
  } finally {
    loading.value = false
  }
}

watch(
  postId,
  (id) => {
    if (id) {
      loadPost(id)
    }
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
    const newPage = await postStore.createPage({ blocs: [] })
    const newPost = await postStore.createPost({
      name: name.value,
      headline: headline.value,
      kind: 'page',
      body_type: 'blocs',
      content_as_page: newPage.id,
      tags: config.website.cms?.site_tag ? [config.website.cms.site_tag] : []
    })
    await router.push(`/admin/cms/edit/${newPost.id}`)
  } catch {
    error.value = 'Erreur lors de la création.'
  } finally {
    saving.value = false
  }
}

const handleSave = async (updatedPage: Page) => {
  if (!page.value) return
  saving.value = true
  try {
    page.value = await postStore.savePage(page.value.id, updatedPage)
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
  <div>
    <div v-if="loading" class="fr-container fr-py-6w">
      <p>Chargement…</p>
    </div>

    <div v-else-if="isCreate" class="fr-container fr-py-4w">
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
    </div>

    <template v-else-if="post">
      <div class="fr-container fr-py-2w">
        <div class="fr-grid-row fr-grid-row--middle">
          <h1 class="fr-h2 fr-mr-auto fr-mb-0">{{ post.name }}</h1>
          <div class="fr-btns-group fr-btns-group--inline">
            <RouterLink
              to="/admin/cms"
              class="fr-btn fr-btn--secondary fr-btn--sm"
            >
              Retour à la liste
            </RouterLink>
            <RouterLink
              :to="`/pages/${post.slug}`"
              class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line fr-btn--icon-left"
            >
              Voir la page
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
        <div class="fr-mt-1w">
          <span v-if="post.published" class="fr-badge fr-badge--success"
            >Publié</span
          >
          <span v-else class="fr-badge fr-badge--new">Brouillon</span>
        </div>
      </div>

      <div v-if="error" class="fr-container fr-py-1w">
        <div class="fr-alert fr-alert--error">
          <p>{{ error }}</p>
        </div>
      </div>

      <PageShow v-if="page" :page="page" :edit="true" @save="handleSave" />
      <div v-else class="fr-container fr-py-3w">
        <p>Aucune page de blocs associée.</p>
      </div>
    </template>

    <div v-else class="fr-container fr-py-4w">
      <p>{{ error || 'Page introuvable.' }}</p>
    </div>
  </div>
</template>
