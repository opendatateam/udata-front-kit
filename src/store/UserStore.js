import axios from 'axios'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'token'

export const useUserStore = defineStore('user', {
  state: () => ({
    client: axios.create(),
    data: {},
    isLoggedIn: false,
    token: undefined
  }),
  actions: {
    /**
     * Init store from localStorage
     */
    init() {
      const token = localStorage.getItem(STORAGE_KEY)
      if (token) this.login(token)
    },
    /**
     * Store user info after login
     */
    login(token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
      this.isLoggedIn = true
      this.token = token
      localStorage.setItem(STORAGE_KEY, token)
    },
    /**
     * Reflect logged-out state
     */
    logout() {
      this.client = axios.create()
      this.data = {}
      this.isLoggedIn = false
      this.token = undefined
      localStorage.removeItem(STORAGE_KEY)
    },
    /**
     * Store user infos
     */
    storeInfo(data) {
      this.data = data
    },
    /**
     * Is the user logged-in and admin ?
     */
    isAdmin() {
      return this.isLoggedIn && this.data?.roles?.includes('admin')
    }
  }
})
