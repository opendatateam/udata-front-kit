import axios from 'axios'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { createPinia, setActivePinia } from 'pinia'
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

import type { Discussion, Post, Subject, SubjectId } from '@/model/discussion'
import type { User } from '@/model/user'
import { DiscussionsAPI } from '@/services/api/resources/DiscussionsAPI'
import { useDiscussionStore } from '@/store/DiscussionStore'

interface P {
  store: ReturnType<typeof useDiscussionStore>
}

type R = Promise<void>

const subjectId: SubjectId = uuid()
const subject: Subject = { class: 'Topic', id: subjectId }
const user: User = { firstName: 'Jean', lastName: 'Serien' }

const message: Post = {
  content: 'Coucou !',
  postedBy: user,
  postedOn: '2022-03-18T16:38:37.360000+00:00'
}

const discussion: Discussion = {
  discussion: [message],
  id: uuid(),
  subject,
  title: 'Testing social bouquets'
}

const baseUrl = 'https://example.lol'
const version = '1234'
const endpoint = 'asdf'

const ok = subjectId
const notFound = uuid()
const serverError = undefined

const server = setupServer(
  http.get(`${baseUrl}/${version}/${endpoint}/`, ({ request }) => {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('for')

    if (subjectId === ok) {
      return HttpResponse.json(
        { data: [{ title: 'Mise à jour des ressources' }] },
        { status: 200 }
      )
    }

    if (subjectId === notFound) {
      return HttpResponse.json(
        { message: 'The requested URL was not found on the server' },
        { status: 404 }
      )
    }

    if (subjectId === serverError || subjectId === 'undefined') {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      )
    }

    return HttpResponse.error()
  })
)

beforeEach((context: P): void => {
  setActivePinia(createPinia())
  const store = useDiscussionStore()
  const httpClient = axios.create()
  httpClient.defaults.proxy = false
  store.client = new DiscussionsAPI({ baseUrl, version, endpoint, httpClient })
  store.subjectId = subject.id
  context.store = store
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

describe('list discussions for subject', (): void => {
  test('with discussions', ({ store }: P) => {
    store.data[subject.id] = { [store.page]: [discussion] }
    expect(store.get).toEqual([discussion])
  })

  test('without discussions', ({ store }: P): void => {
    expect(store.get).toEqual([])
  })

  test('with pagination', ({ store }: P): void => {
    store.data[subject.id] = { [store.page]: [discussion] }
    store.page += 1
    expect(store.get).toEqual([])
  })
})

describe('set discussions for subject', (): void => {
  test('with discussions', ({ store }: P): void => {
    store.data[subject.id] = { [store.page]: [discussion] }
    store.set({ items: [discussion] })
    expect(store.get).toEqual([discussion])
  })

  test('without discussions', ({ store }: P): void => {
    store.set({ items: [discussion] })
    expect(store.get).toEqual([discussion])
  })

  test('with pagination', ({ store }: P): void => {
    store.set({ items: [discussion] })
    store.page += 1
    expect(store.get).toEqual([])
  })
})

describe('fetch discussions for subject', (): void => {
  test('with discussions', async ({ store }: P): R => {
    store.subjectId = ok
    await store.fetch()
    expect(store.get).toEqual([{ title: 'Mise à jour des ressources' }])
    expect(store.error).toBe(false)
    expect(store.errorMessage).toBeNull()
  })

  test('without discussions', async ({ store }: P): R => {
    store.subjectId = notFound
    expect(await store.fetch()).toEqual([])
    expect(store.error).toBe(true)
    expect(store.errorMessage).toMatch(/the requested url/i)
  })

  test('with server error', async ({ store }: P): R => {
    store.subjectId = serverError
    expect(await store.fetch()).toEqual([])
    expect(store.error).toBe(true)
    expect(store.errorMessage).toMatch(/'subjectId' is required/i)
  })
})
