import { defineStore } from "pinia"

// FIXME: we cant use UserAPI here (circular dep?)

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
      const token = localStorage.getItem("token")
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
      localStorage.setItem("token", token)
    },
    /**
     * Store user infos
     */
    storeInfo (data) {
      this.data = data
    },
  },
})
