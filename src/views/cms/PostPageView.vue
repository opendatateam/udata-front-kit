<script lang="ts" setup>
import type { Post } from '@datagouv/components-next'

import PageShow from '@/components/cms/PageShow.vue'
import { usePostStore } from '@/store/PostStore'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const postStore = usePostStore()
const userStore = useUserStore()

const id = computed(() => props.id ?? (route.params.id as string))

const post = ref<Post | null>(null)
const loading = ref(true)
const error = ref(false)

const breadcrumbLinks = computed(() => {
  const base = [
    { to: '/', text: 'Accueil' },
    { to: '/admin/cms', text: 'CMS' }
  ]
  return [...base, { text: post.value?.name ?? '…' }]
})

onMounted(async () => {
  try {
    post.value = await postStore.fetchPostById(id.value)
    if (post.value.body_type === 'blocs' && post.value.content_as_page) {
      await postStore.fetchPage(post.value.content_as_page.id)
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const renderedMarkdown = computed(() => {
  if (!post.value || post.value.body_type !== 'markdown') return ''
  return fromMarkdown(post.value.content)
})

const page = computed(() => postStore.currentPage)
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--middle justify-between">
      <div class="fr-col">
        <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
      </div>
      <div v-if="userStore.isAdmin && post" class="fr-col-auto">
        <RouterLink
          :to="`/admin/cms/edit/${post.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-edit-line fr-btn--icon-left"
        >
          Modifier
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-if="loading" class="fr-container fr-py-6w">
    <p>Chargement…</p>
  </div>

  <div v-else-if="error" class="fr-container fr-py-6w">
    <p>Page introuvable.</p>
  </div>

  <template v-else-if="post">
    <template v-if="post.body_type === 'blocs' && page">
      <PageShow :page="page" :edit="false" />
    </template>

    <template v-else-if="post.body_type === 'markdown'">
      <div class="fr-container fr-py-4w">
        <h1>{{ post.name }}</h1>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="fr-prose" v-html="renderedMarkdown" />
      </div>
    </template>

    <template v-else>
      <div class="fr-container fr-py-4w">
        <h1>{{ post.name }}</h1>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="post.content" />
      </div>
    </template>
  </template>
</template>
