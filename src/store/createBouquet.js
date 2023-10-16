import { defineStore } from 'pinia'
import { useBouquetInformationStore } from '@/store/createBouquet-information'
import { useBouquetDatauseStore } from '@/store/createBouquet-datauses'

export const createBouquetStore = (client) => {
  return defineStore('createBouquet', {
    state: () => ({
      data: {
        id: null,
        name: null,
        description: null,
        information: null,
        datauses: [],
        tags: []
      },
      error: null
    }),
    actions: {
      async create(bouquet) {
        const response = await client.create(bouquet)

        if (response.status === 201) {
          this.data.id = response.data.id
          this.data.name = response.data.name
          this.data.description = response.data.description
          this.data.tags = response.data.tags
        } else {
          this.error = 'error'
        }

        return this
      },
      async addInformation(bouquet) {
        const response = await client.update(
          this.data.id,
          this.serialize(bouquet)
        )

        if (response.status === 200) {
          this.data = this.deserialize(response.data)
          console.log(bouquetInformation.create(response))
        } else if (response.status === 400) {
          this.error = 'error'
        } else {
          this.error = 'not found'
        }

        return this
      },
      async addDatause(datause) {
        const response = await client.update(
          this.data.id,
          this.serialize(datause)
        )
        // const bouquetDatause = useBouquetDatauseStore()

        if (response.status === 200) {
          this.data = this.deserialize(response.data)
        } else if (response.status === 400) {
          this.error = 'error'
        } else {
          this.error = 'not found'
        }

        return this
      },
      deserialize(payload) {},
      serialize(payload) {
        // 1ere chose : Serialiser le name, description, tags
        let serializedPayload = {}
        serializedPayload = {
          name: this.data.name,
          description: this.data.description,
          tags: this.data.tags
        }

        // 2  serialiser linformation si existant
        if (this.data.information) {
          serializedPayload = this.data.information.serialize(serializedPayload)
        } else {
          const bouquetInformation = useBouquetInformationStore()
          serializedPayload = bouquetInformation.serialize(serializedPayload)
        }

        // 3  serialiser les datauses si existant
        if (this.data.datauses) {
          this.data.datauses.map((item) => {
            serializedPayload = item.serialize(serializedPayload)
          })
        }

        return { ...serializedPayload, ...payload }
      }
    }
  })
}
