import { defineStore } from "pinia"

// FIXME: we cant use UserAPI here (circular dep?)
// maybe try to use the service that will use the API

const STORAGE_KEY = "token"

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    data: {},
    token: undefined,
  }),
  actions: {
    /**
     * Init store from localStorage
     */
    init () {
      const token = localStorage.getItem(STORAGE_KEY)
      if (token) {
        this.token = token
        this.isLoggedIn = true
      }
    },
    /**
     * Store user info after login
     */
    login (token) {
      this.isLoggedIn = true
      this.token = token
      localStorage.setItem(STORAGE_KEY, token)
    },
    /**
     * Reflet logged-out state
     */
    logout () {
      this.isLoggedIn = false
      this.token = undefined
      this.data = {}
      localStorage.removeItem(STORAGE_KEY)
    },
    /**
     * Store user infos
     */
    storeInfo (data) {
      this.data = data
    },
    /**
     * Is the user logged-in and admin ?
     */
    isAdmin () {
      return this.isLoggedIn && this.data?.roles?.includes("admin")
    }
  },
})
