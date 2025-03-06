import type { ContactPointRole } from '@/model/contactPoint'
import ContactPointAPI from '@/services/api/resources/ContactPointAPI'
import { defineStore } from 'pinia'

const api = new ContactPointAPI()

interface RootState {
  roles: ContactPointRole[]
}

export const useContactPointStore = defineStore('contactPoint', {
  state: (): RootState => ({
    roles: []
  }),
  actions: {
    async loadRoles() {
      if (!this.roles.length) {
        this.roles = await api.getRoles()
      }
      return this.roles
    }
  }
})
