import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, afterAll, beforeAll, test, expect, vi } from 'vitest'

import { createTestingPinia } from '@pinia/testing'
import config from '@/config'

import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

// FIXME: remove once API dependencies to stores are cleaned up
// create a fake pinia because current API code refers to stores
createTestingPinia({ createSpy: vi.fn })

// FIXME: should mock config more generally or use a test config
// mock base url to avoid hitting demo.data.gouv in case MSW isn't properly configured
config.datagouvfr.base_url = "http://localhost"

const client = new DatagouvfrAPI('topics')
const url = client.url()

const server = setupServer(
  http.delete(`${url}/1`, () => {
    return new HttpResponse(null, { status: 204 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('delete when deleted', async () => {
  const response = await client.delete(1)
  expect(response.status).toBe(204)
})
