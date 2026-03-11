<script lang="ts" setup>
import type { Post } from '@datagouv/components-next'

import GenericContainer from '@/components/GenericContainer.vue'
import config from '@/config'
import { usePostStore } from '@/store/PostStore'
import { formatDate } from '@/utils'

const postStore = usePostStore()
const posts = ref<Post[]>([])
const loading = ref(true)

const cmsPages = config.website.cms?.pages ?? []
const routeForPost = (postId: string) =>
  cmsPages.find((p) => p.id === postId)?.route ?? null

const links = [{ to: '/', text: 'Accueil' }, { text: 'CMS' }]

onMounted(async () => {
  try {
    posts.value = await postStore.listAdminPosts()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">Pages CMS</h1>
      <div class="fr-col-auto">
        <RouterLink
          to="/admin/cms/add"
          class="fr-btn fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
        >
          Nouvelle page
        </RouterLink>
      </div>
    </div>
  </div>
  <GenericContainer>
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
          <th scope="col">Identifiant</th>
          <th scope="col">Route</th>
          <th scope="col">Statut</th>
          <th scope="col">Dernière modification</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td>{{ post.name }}</td>
          <td>
            <code>{{ post.id }}</code>
          </td>
          <td>
            <RouterLink
              v-if="routeForPost(post.id)"
              :to="routeForPost(post.id)!"
              class="fr-link fr-text--sm"
              >{{ routeForPost(post.id) }}</RouterLink
            >
            <span v-else class="fr-text--sm fr-text-mention--grey">—</span>
          </td>
          <td>
            <span v-if="post.published" class="fr-badge fr-badge--success"
              >Publié</span
            >
            <span v-else class="fr-badge fr-badge--new">Brouillon</span>
          </td>
          <td>{{ formatDate(post.last_modified, true) }}</td>
          <td>
            <div class="fr-grid-row fr-grid-row--middle flex-gap">
              <RouterLink
                :to="`/admin/cms/view/${post.id}`"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
              >
                Voir
              </RouterLink>
              <RouterLink
                :to="`/admin/cms/edit/${post.id}`"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
              >
                Modifier
              </RouterLink>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </GenericContainer>
</template>
