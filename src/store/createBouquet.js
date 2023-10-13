import { defineStore } from "pinia"
import { useBouquetInformationStore } from "@/store/createBouquet-information"

export const createBouquetStore = (client) => {
  return defineStore ('createBouquet', {
    state: () => ({
      data: {
        id: null,
        name: null,
        description: null,
        information: null,
        tags: []
      },
      error: null
    }),
    actions: {
      async create(bouquet) {
        const response = await client.create(bouquet)

        if(response.status === 201) {
          this.data.id = response.data.id
          this.data.name = response.data.name
          this.data.description = response.data.description
          this.data.tags = response.data.tags
        } else {
          this.error = "error"
        }
        
        return this
      },
      async addInformation(bouquet){
        const payload = {
          extras: {
            subject: bouquet.subject,
            theme: bouquet.theme,
            'sub-theme': bouquet.subTheme
          }
        }
        const response = await client.update(this.data.id, {...this.data, ...payload})
        const bouquetInformation = useBouquetInformationStore()

        console.log('bouquetInformation', bouquetInformation)
        if (response.status === 200) {
          this.data.information = bouquetInformation.create(response)
        } else if (response.status === 400) {
          this.error = "error"
        } else {
          this.error = "not found"
        }

        return this
      }
    }
  })
}