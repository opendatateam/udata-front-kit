import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, afterAll, beforeAll, test, expect } from 'vitest'

import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

const client = new DatagouvfrAPI({ endpoint: 'topics' })
const url = client.url()

const server = setupServer(
  http.delete(`${url}/1/`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(`${url}/2/`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete(`${url}/3/`, () => {
    return HttpResponse.error()
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('delete when 2XX', async () => {
  const { status } = await client.delete(1)
  expect(status).toEqual(204)
})

test('delete when 4XX', async () => {
  const { status } = await client.delete(2)
  expect(status).toEqual(404)
})

test('delete something else', async () => {
  const { message } = await client.delete(3)
  expect(message).toMatch(/network error/i)
})
