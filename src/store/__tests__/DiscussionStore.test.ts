import axios from 'axios'
import { last } from 'lodash/fp'
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
  test,
  vi
} from 'vitest'
import { toValue } from 'vue'

import type { Meta } from '@/model/api'
import type { Discussion, Post, Subject, SubjectId } from '@/model/discussion'
import type { Cache } from '@/model/store'
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

const meta: Meta = {
  page: 1,
  pageSize: 20,
  total: 1
}

const data: Cache<Discussion[]> = { items: [discussion], meta }

const baseUrl = 'https://example.lol'
const version = '1234'
const endpoint = 'asdf'

const ok = subjectId
const okTwo = uuid()
const notFound = uuid()
const serverError = undefined

const server = setupServer(
  http.get(`${baseUrl}/${version}/${endpoint}/`, ({ request }) => {
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('for')
    const page = url.searchParams.get('page')

    if (subjectId === ok) {
      return HttpResponse.json(
        {
          data: [{ title: 'Mise à jour des ressources' }],
          page: Number(page),
          page_size: 1,
          total: 2
        },
        { status: 200 }
      )
    }

    if (subjectId === okTwo) {
      return HttpResponse.json(
        {
          data: [{ title: 'Mise à jour des ressources' }],
          page: Number(page),
          page_size: 1,
          total: 1
        },
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
  vi.restoreAllMocks()
})

afterAll(() => {
  server.close()
})

describe('list discussions for subject', (): void => {
  test('with discussions', ({ store }: P) => {
    store.discussions[subject.id] = { [meta.page]: data }
    expect(store.getDiscussions).toEqual([discussion])
  })

  test('without discussions', ({ store }: P): void => {
    expect(store.getDiscussions).toEqual([])
  })

  test('with pagination', ({ store }: P): void => {
    store.discussions[subject.id] = { [meta.page]: data }
    store.discussionsPage += 1
    expect(store.getDiscussions).toEqual([])
  })
})

describe('set discussions for subject', (): void => {
  test('with discussions', ({ store }: P): void => {
    store.discussions[subject.id] = { [meta.page]: data }
    store.setDiscussions({ subjectId: subject.id, items: [discussion], meta })
    expect(store.getDiscussions).toEqual([discussion])
  })

  test('without discussions', ({ store }: P): void => {
    store.setDiscussions({ subjectId: subject.id, items: [discussion], meta })
    expect(store.getDiscussions).toEqual([discussion])
  })

  test('with pagination', ({ store }: P): void => {
    store.setDiscussions({ subjectId: subject.id, items: [discussion], meta })
    store.discussionsPage += 1
    expect(store.getDiscussions).toEqual([])
  })
})

describe('fetch discussions for subject', (): void => {
  test('with discussions', async ({ store }: P): R => {
    await store.fetchDiscussions({ subjectId: ok })
    const result = last(toValue(store.getDiscussions)) as Discussion
    expect(result.title).toEqual('Mise à jour des ressources')
    expect(store.error).toBe(false)
  })

  test('without discussions', async ({ store }: P): R => {
    await store.fetchDiscussions({ subjectId: notFound })
    expect(store.error).toBe(true)
    expect(store.errorType).toEqual('404')
    expect(store.errorValue).toMatch(/the requested url/i)
  })

  test('with server error', async ({ store }: P): R => {
    const subjectId = serverError as unknown as string
    await store.fetchDiscussions({ subjectId })
    expect(store.error).toBe(true)
    expect(store.errorType).toEqual('ValueError')
    expect(store.errorValue).toMatch(/subjectId/i)
  })

  test('with cache', async ({ store }: P): R => {
    const client = vi.spyOn(store.client, 'list')
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage += 1
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage -= 1
    await store.fetchDiscussions({ subjectId: ok })
    expect(client).toHaveBeenCalledTimes(2)
  })
})

describe('pagination', (): void => {
  test('when ok', async ({ store }: P): R => {
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage += 1
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage -= 1
    await store.fetchDiscussions({ subjectId: okTwo })
    const pages = toValue(store.discussionsPages)
    await store.fetchDiscussions({ subjectId: ok })
    expect(toValue(store.discussionsPages)).not.toEqual(pages)
  })

  test('when not found', async ({ store }: P): R => {
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage += 1
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage -= 1
    await store.fetchDiscussions({ subjectId: notFound })
    const pages = toValue(store.discussionsPages)
    await store.fetchDiscussions({ subjectId: ok })
    expect(toValue(store.discussionsPages)).not.toEqual(pages)
  })

  test('when server error', async ({ store }: P): R => {
    const subjectId = serverError as unknown as string
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage += 1
    await store.fetchDiscussions({ subjectId: ok })
    store.discussionsPage -= 1
    await store.fetchDiscussions({ subjectId })
    const pages = toValue(store.discussionsPages)
    await store.fetchDiscussions({ subjectId: ok })
    expect(toValue(store.discussionsPages)).not.toEqual(pages)
  })
})
