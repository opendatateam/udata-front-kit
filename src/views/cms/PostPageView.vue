<script lang="ts" setup>
import { useRouter } from 'vue-router'

import PageShow from '@/components/cms/PageShow.vue'
import { usePostStore } from '@/store/PostStore'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()

const id = computed(() => props.id ?? (route.params.id as string))

const post = ref(postStore.currentPost)
const loading = ref(true)
const error = ref(false)

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
  <div>
    <div v-if="loading" class="fr-container fr-py-6w">
      <p>Chargement…</p>
    </div>

    <div v-else-if="error" class="fr-container fr-py-6w">
      <p>Page introuvable.</p>
    </div>

    <template v-else-if="post">
      <div
        v-if="userStore.isAdmin"
        class="fr-container fr-py-2w"
        style="display: flex; justify-content: flex-end"
      >
        <RouterLink
          :to="`/admin/cms/edit/${post.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-edit-line fr-btn--icon-left"
        >
          Modifier
        </RouterLink>
      </div>

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
  </div>
</template>
