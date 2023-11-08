import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test
} from 'vitest'

import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

const baseUrl = 'https://example.lol'
const endpoint = 'asdf1234'

const server = setupServer(
  http.delete(`${baseUrl}/1/${endpoint}/1`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(`${baseUrl}/1/${endpoint}/2/`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete(`${baseUrl}/1/${endpoint}/3/`, () => {
    return HttpResponse.error()
  })
)

beforeAll(() => {
  server.listen()
})

beforeEach(async (context) => {
  // FIXME: remove once API dependencies to stores are cleaned up
  setActivePinia(createPinia())
  const httpClient = axios.create()
  httpClient.defaults.proxy = false
  context.client = new DatagouvfrAPI({
    baseUrl,
    endpoint,
    httpClient
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

test('delete when 2XX', async ({ client }) => {
  const { status } = await client.delete(1)
  expect(status).toEqual(204)
})

test('delete when 4XX', async ({ client }) => {
  const { status } = await client.delete(2)
  expect(status).toEqual(404)
})

test('delete something else', async ({ client }) => {
  const { message } = await client.delete(3)
  expect(message).toMatch(/network error/i)
})
