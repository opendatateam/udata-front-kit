import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

const baseUrl = 'https://example.com'
const version = 3
const endpoint = 'an-endpoint'

const endpointUrl = (suffixed?: boolean): string => {
  return `${baseUrl}/${version}/${endpoint}${suffixed === true ? '/' : ''}`
}

describe('DatagouvfrAPI', () => {
  let mock: MockAdapter
  let api: DatagouvfrAPI

  beforeEach(() => {
    // FIXME: remove once API dependencies to stores are cleaned up
    setActivePinia(createPinia())
    mock = new MockAdapter(axios, { onNoMatch: 'throwException' })
    api = new DatagouvfrAPI({
      baseUrl,
      version,
      endpoint
    })
  })

  afterEach(() => {
    mock.reset()
  })

  it('gets an entity', async () => {
    const entityId = '123'
    const entityData = { id: entityId, name: 'Test Entity' }
    mock.onGet(`${endpointUrl()}/${entityId}/`).reply(200, entityData)

    const data = await api.get({ entityId })
    expect(data).toEqual(entityData)
  })

  it('lists entities', async () => {
    const entitiesData = [
      { id: '123', name: 'Test Entity 1' },
      { id: '456', name: 'Test Entity 2' }
    ]
    mock.onGet(endpointUrl(true)).reply(200, entitiesData)

    const data = await api.list({})
    expect(data).toEqual(entitiesData)
  })

  it('creates an entity', async () => {
    const newEntityData = { name: 'New Entity' }
    mock.onPost(endpointUrl(true)).reply(201, newEntityData)

    const data = await api.create({ data: newEntityData })
    expect(data).toEqual(newEntityData)
  })

  it('updates an entity', async () => {
    const entityId = '123'
    const updatedEntityData = { id: entityId, name: 'Updated Entity' }
    mock.onPut(`${endpointUrl()}/${entityId}/`).reply(200, updatedEntityData)

    const data = await api.update({ entityId, data: updatedEntityData })
    expect(data).toEqual(updatedEntityData)
  })

  it('deletes an entity', async () => {
    const entityId = '123'
    mock.onDelete(`${endpointUrl()}/${entityId}/`).reply(204)

    const data = await api.delete({ entityId })
    expect(data).toEqual(undefined)
  })
})
