<script lang="ts" setup>
import type { Post } from '@datagouv/components-next'

import { usePostStore } from '@/store/PostStore'
import { formatDate } from '@/utils'

const postStore = usePostStore()
const posts = ref<Post[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    posts.value = await postStore.listAdminPosts()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="fr-container fr-py-4w">
    <div class="fr-grid-row fr-grid-row--middle fr-mb-3w">
      <h1 class="fr-h2 fr-mr-auto fr-mb-0">Pages CMS</h1>
      <RouterLink
        to="/admin/cms/add"
        class="fr-btn fr-icon-add-circle-line fr-btn--icon-left"
      >
        Nouvelle page
      </RouterLink>
    </div>

    <div v-if="loading">
      <p>Chargement…</p>
    </div>

    <div v-else-if="posts.length === 0">
      <p>Aucune page créée pour le moment.</p>
    </div>

    <table v-else class="fr-table">
      <caption class="fr-sr-only">
        Liste des pages CMS
      </caption>
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Statut</th>
          <th scope="col">Dernière modification</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td>{{ post.name }}</td>
          <td>
            <span v-if="post.published" class="fr-badge fr-badge--success"
              >Publié</span
            >
            <span v-else class="fr-badge fr-badge--new">Brouillon</span>
          </td>
          <td>{{ formatDate(post.last_modified, true) }}</td>
          <td>
            <RouterLink
              :to="`/admin/cms/edit/${post.id}`"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
            >
              Modifier
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
