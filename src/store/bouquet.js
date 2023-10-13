import { defineStore } from "pinia"

export const createBouquetStore = (client) => {
  return defineStore ('bouquet', {
    state: () => ({
      data: {
        id: null,
        name: null,
        description: null,
        subject: null,
        theme: null,
        subTheme: null,
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
      async update(bouquet){
        const payload = {
          extras: {
            subject: bouquet.subject,
            theme: bouquet.theme,
            'sub-theme': bouquet.subTheme
          }
        }
        const response = await client.update(this.data.id, {...this.data, ...payload})

        if (response.status === 200) {
          this.data.subject = response.data.extras.subject
          this.data.theme = response.data.extras.theme
          this.data.subTheme = response.data.extras['sub-theme']
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