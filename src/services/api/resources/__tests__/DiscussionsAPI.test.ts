import axios from 'axios'
import { last } from 'lodash/fp'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { v4 as uuid } from 'uuid'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test
} from 'vitest'

import type { AppError, Response } from '@/model/api'
import type { Discussion } from '@/model/discussion'
import { DiscussionsAPI } from '@/services/api/resources/DiscussionsAPI'

interface P {
  client: DiscussionsAPI
}

type R = Promise<void>

const baseUrl = 'https://example.lol'
const version = '1234'
const endpoint = 'asdf'

const okPagination = uuid()
const okList = uuid()
const okListWithPagination = uuid()
const okEmpty = uuid()
const notFound = uuid()
const serverError = undefined
const networkError = uuid()

const server = setupServer(
  http.get(`${baseUrl}/${version}/${endpoint}/`, ({ request }) => {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('for')
    const page = url.searchParams.get('page')
    const pageSize = url.searchParams.get('page_size')

    if (subjectId === okPagination) {
      return HttpResponse.json({ page_size: Number(pageSize) }, { status: 200 })
    }

    if (subjectId === okList) {
      return HttpResponse.json(
        { data: [{ title: 'Mise à jour des ressources' }] },
        { status: 200 }
      )
    }

    if (subjectId === okListWithPagination) {
      return HttpResponse.json(
        {
          data: [{ title: 'Archive corrompue' }],
          page: Number(page),
          page_size: Number(pageSize)
        },
        { status: 200 }
      )
    }

    if (subjectId === okEmpty) {
      return HttpResponse.json({ data: [] }, { status: 200 })
    }

    if (subjectId === notFound) {
      return HttpResponse.json(
        { message: 'The requested URL was not found on the server' },
        { status: 404 }
      )
    }

    if (subjectId === 'undefined') {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      )
    }

    return HttpResponse.error()
  })
)

beforeEach(async (context: P): R => {
  const httpClient = axios.create()
  httpClient.defaults.proxy = false
  context.client = new DiscussionsAPI({
    baseUrl,
    version,
    endpoint,
    httpClient
  })
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('Pagination /discussions', (): void => {
  test('pagination', async ({ client }: P): R => {
    const subjectId = okPagination
    const response = await client.list({ subjectId })
    const { data, status } = response as Response<Discussion[]>
    expect(status).toEqual(200)
    expect(data?.pageSize).toEqual(20)
  })
})

describe(' GET /discussions', (): void => {
  test('with discussions', async ({ client }: P): R => {
    const subjectId = okList
    const response = await client.list({ subjectId })
    const { data, status } = response as Response<Discussion[]>
    const { title } = last(data?.data) as Discussion
    expect(status).toEqual(200)
    expect(title).toMatch(/mise à jour des ressources/i)
  })

  test('with discussions + pagination', async ({ client }: P): R => {
    const subjectId = okListWithPagination
    const page = 2
    const pageSize = 1
    const response = await client.list({ subjectId, page, pageSize })
    const { data, status } = response as Response<Discussion[]>
    const { title } = last(data?.data) as Discussion
    expect(status).toEqual(200)
    expect(title).toMatch(/archive corrompue/i)
  })

  test('without discussions', async ({ client }: P): R => {
    const subjectId = okEmpty
    const response = await client.list({ subjectId })
    const { data, status } = response as Response<Discussion[]>
    expect(status).toEqual(200)
    expect(data?.data).toEqual([])
  })

  test('w/o discussions + pagination', async ({ client }: P): R => {
    const subjectId = notFound
    const page = 2
    const response = await client.list({ subjectId, page })
    const { error, status } = response as AppError
    expect(status).toEqual(404)
    expect(error).toMatch(/the requested URL was not found on the server/i)
  })

  test('with invalid subject', async ({ client }: P): R => {
    const subjectId = serverError as unknown as string
    const response = await client.list({ subjectId })
    const { error, status } = response as AppError
    expect(status).toEqual(500)
    expect(error).toMatch(/internal server error/i)
  })

  test('when something weird happens', async ({ client }: P): R => {
    const subjectId = networkError
    const response = await client.list({ subjectId })
    const { error, status } = response as AppError
    expect(status).toEqual('ERR_NETWORK')
    expect(error).toMatch(/network error/i)
  })
})
