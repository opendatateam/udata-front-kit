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

import DiscussionsAPI from '@/services/api/DiscussionsAPI'

const baseUrl = 'https://example.lol'
const version = '1234'
const endpoint = 'discussions'
const datasetId = 'your-dataset-id'
const page = 1

const server = setupServer(
  http.get(`${baseUrl}/${version}/${endpoint}/?for=${datasetId}&page=${page}`, () => {
    return HttpResponse.json([], { status: 200 })
  }),

  http.post(`${baseUrl}/${version}/${endpoint}/`, (req, res, ctx) => {
    const data = req.body
    // Assuming you have some logic to validate the request and return a response
    return res(ctx.json(data), ctx.status(201))
  })
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  const httpClient = axios.create()
  httpClient.defaults.proxy = false
  setActivePinia(createPinia())
  context.client = new DiscussionsAPI({
    baseUrl,
    version,
    httpClient,
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

test('get a discussion', async ({ client }) => {
  // TODO: Test on get a discussion
})

test('create a discussion', async ({ client }) => {
  const discussionData = {
    title: 'Title of the discussion',
    comment: 'This is a discussion.',
    subject: {
      class: 'Topic',
      id: 'id123'
    }
  }

  expect(response.id).toBeDefined()
  expect(response.title).toEqual(discussionData.title)
  expect(response.comment).toEqual(discussionData.comment)
  expect(response.subject).toEqual(discussionData.subject)
})
