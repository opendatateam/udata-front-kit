import { defineStore } from 'pinia'

import PagesAPI from '@/services/api/resources/PagesAPI'
import PostsAPI from '@/services/api/resources/PostsAPI'
import type { Page, Post } from '@datagouv/components-next'

const postsAPI = new PostsAPI()
const pagesAPI = new PagesAPI()

export interface RootState {
  posts: Post[]
  currentPost: Post | null
  currentPage: Page | null
  loading: boolean
}

export const usePostStore = defineStore('post', {
  state: (): RootState => ({
    posts: [],
    currentPost: null,
    currentPage: null,
    loading: false
  }),
  actions: {
    async fetchPostById(id: string): Promise<Post> {
      this.loading = true
      try {
        const post = await postsAPI.get({ entityId: id })
        this.currentPost = post
        return post
      } finally {
        this.loading = false
      }
    },
    async fetchPage(pageId: string): Promise<Page> {
      const page = await pagesAPI.get({ entityId: pageId })
      this.currentPage = page
      return page
    },
    async listAdminPosts(): Promise<Post[]> {
      this.loading = true
      try {
        const result = await postsAPI.list({
          params: { kind: 'page', me: 'true' },
          authenticated: true
        })
        this.posts = result.data ?? result
        return this.posts
      } finally {
        this.loading = false
      }
    },
    async createPost(data: object): Promise<Post> {
      return await postsAPI.create({ data })
    },
    async updatePost(postId: string, data: object): Promise<Post> {
      return await postsAPI.update({ entityId: postId, data })
    },
    async savePage(pageId: string, data: object): Promise<Page> {
      const page = await pagesAPI.update({ entityId: pageId, data })
      this.currentPage = page
      return page
    },
    async publishPost(postId: string): Promise<Post> {
      return await postsAPI.publish(postId)
    },
    async unpublishPost(postId: string): Promise<void> {
      return await postsAPI.unpublish(postId)
    },
    async createPage(data: object): Promise<Page> {
      return await pagesAPI.create({ data })
    }
  }
})
