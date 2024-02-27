import type { User } from '@etalab/data.gouv.fr-components'
import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'

import type { WithOwned } from '@/model'
import UserAPI from '@/services/api/resources/UserAPI'

const STORAGE_KEY = 'token'
const userAPI = new UserAPI()

export interface RootState {
  isInited: boolean
  isLoggedIn: boolean
  token: string | undefined
  data: User | undefined
}

export const useUserStore = defineStore('user', {
  state: (): RootState => ({
    isInited: false,
    isLoggedIn: false,
    data: undefined,
    token: undefined
  }),
  getters: {
    loggedIn(state) {
      return state.isLoggedIn
    }
  },
  actions: {
    /**
     * Init store from localStorage
     * If we have a token, fetch user infos from API
     */
    async init(): Promise<User | undefined> {
      const token = localStorage.getItem(STORAGE_KEY)
      if (token !== null) {
        this.token = token
        this.isLoggedIn = true
        let userData: User | undefined
        try {
          userData = await userAPI.list()
        } catch (err) {
          // profile info fetching has failed, we're probably using a bad token
          // keep the current route and redirect to the login flow
          if ((err as AxiosError).response?.status === 401) {
            this.logout()
            localStorage.setItem(
              'lastPath',
              this.$router.currentRoute.value.path
            )
            await this.$router.push({ name: 'login' })
          }
          throw err
        }
        if (userData !== undefined) {
          this.storeInfo(userData)
        }
      }
      this.isInited = true
      return this.data
    },
    /**
     * Store user info after login
     */
    login(token: string) {
      this.isLoggedIn = true
      this.token = token
      localStorage.setItem(STORAGE_KEY, token)
    },
    /**
     * Reflet logged-out state
     */
    logout() {
      this.isLoggedIn = false
      this.token = undefined
      this.data = undefined
      localStorage.removeItem(STORAGE_KEY)
    },
    /**
     * Store user infos
     */
    storeInfo(data: User) {
      this.data = data
    },
    /**
     * Is the user logged-in and admin ?
     */
    isAdmin() {
      return this.isLoggedIn && this.data?.roles?.includes('admin')
    },
    /**
     * Has current user edit permissions on given object?
     */
    hasEditPermissions<T>(object: WithOwned<T> | null): boolean {
      if (object === null) return false
      if (!this.isLoggedIn) return false
      if (this.isAdmin() === true) return true
      return object.owner?.id === this.data?.id
    }
  }
})
