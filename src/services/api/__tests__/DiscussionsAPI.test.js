import axios from 'axios'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { createPinia, setActivePinia } from 'pinia'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test
} from 'vitest'

import DiscussionsAPI from '@/services/api/resources/DiscussionsAPI'

const baseUrl = 'https://example.lol'
const version = '1234'
const endpoint = 'discussions'

const discussionRequest = {
  title: 'Title of the discussion',
  comment: 'This is a discussion.',
  subject: {
    class: 'Topic',
    id: 'id123'
  }
}

const server = setupServer(
  http.post(`${baseUrl}/${version}/${endpoint}/`, () => {
    return HttpResponse.json(discussionRequest, { status: 200 })
  })
)

beforeAll(() => {
  server.listen()
})

beforeEach(async (context) => {
  const httpClient = axios.create()
  httpClient.defaults.proxy = false
  setActivePinia(createPinia())
  context.client = new DiscussionsAPI({
    baseUrl,
    version,
    httpClient
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

test('create a discussion', async ({ client }) => {
  const { data } = await client.create(discussionRequest)
  expect(data.title).toEqual(discussionRequest.title)
})
