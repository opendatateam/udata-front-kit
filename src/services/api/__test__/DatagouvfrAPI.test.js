import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, afterAll, beforeAll, test, expect } from 'vitest'

import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

const client = new DatagouvfrAPI('topics')
const url = client.url()

const server = setupServer(
  http.delete(`${url}/1/`, ({}) => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(`${url}/2/`, ({}) => {
    return new HttpResponse(null, { status: 403 })
  }),

  http.delete(`${url}/3/`, ({}) => {
    return new HttpResponse(null, { status: 404 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('delete when deleted', async () => {
  const response = await client.delete(1)
  expect(response.status).toBe(204)
})

test('delete when forbidden', async () => {
  const response = await client.delete(2)
  expect(response.status).toBe(403)
})

test('delete when not found', async () => {
  const response = await client.delete(3)
  expect(response.status).toBe(404)
})
