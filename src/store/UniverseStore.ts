import { defineStore } from 'pinia'

import config from '@/config'
import type { GenericElement, Topic } from '@/model/topic'
import LocalStorageService from '@/services/LocalStorageService'
import SearchAPI from '@/services/api/SearchAPI'
import { useSiteId } from '@/utils/config'
import { mergeConfigAndPersist } from '@/utils/configMerge'

import { useTopicElementStore } from './TopicElementStore'
import { useTopicStore } from './TopicStore'
import { useUserStore } from './UserStore'

// One Topic per site, its id kept in localStorage — same shape as the
// config-editor persistence (see @/config.ts's configStorageKey). Scoped to
// datasets only for now: dataservices/reuses need separate handling (see
// the ConfigEditorView discussion — reuses' search API doesn't support
// filtering by Topic membership the way datasets/dataservices do).
const universeTopicStorageKey = `universe-topic:${config.site_id}`

export interface UniverseState {
  topicId: string | null
  topic: Topic | null
  datasets: GenericElement[]
  pendingDatasetIds: string[]
  bulkAddingOrgId: string | null
  loading: boolean
  error: string | null
}

export const useUniverseStore = defineStore('universe', {
  state: (): UniverseState => ({
    topicId: LocalStorageService.getItem(universeTopicStorageKey) ?? null,
    topic: null,
    datasets: [],
    pendingDatasetIds: [],
    bulkAddingOrgId: null,
    loading: false,
    error: null
  }),
  actions: {
    async init() {
      if (this.topicId && !this.topic) {
        await this.load()
      }
    },
    async load() {
      if (!this.topicId) return
      this.loading = true
      this.error = null
      try {
        this.topic = await useTopicStore().load(this.topicId)
        // Copy, don't alias: getTopicElements() returns its *internal*
        // cache array by reference. Without the spread, this.datasets and
        // TopicElementStore.elements[topicId] are the same array object —
        // createElement()'s later `.push()` then mutates this.datasets in
        // place too, so the next addDataset's own `[...this.datasets,
        // created]` double-counts that first item. Confirmed live: the
        // very next add after a load() always duplicated, every
        // subsequent one was fine (the first add's spread naturally
        // breaks the aliasing).
        this.datasets = [
          ...(await useTopicElementStore().getTopicElements({
            topicId: this.topicId,
            classes: ['Dataset']
          }))
        ]
        // Self-heal: the universe topic itself lives on data.gouv.fr and
        // survives independently, but config.pages.datasets.universe_query
        // only lives in this browser's localStorage (see
        // configMerge.ts) — "Supprimer la configuration locale" wipes it
        // back to the pristine config.yaml's value even though the
        // universe still exists. Re-propagate only when it's genuinely
        // unset; never clobber a universe_query the user deliberately
        // pointed elsewhere via the config editor (e.g. a manual tag).
        if (!config.pages.datasets?.universe_query) {
          this.propagateToConfig()
        }
      } catch {
        // stale/invalid id (e.g. topic deleted on data.gouv.fr) — drop it
        // rather than getting stuck on a permanent error
        this.error =
          'Impossible de charger votre univers, il a peut-être été supprimé.'
        this.topicId = null
        this.topic = null
        LocalStorageService.removeItem(universeTopicStorageKey)
      } finally {
        this.loading = false
      }
    },
    async create(name: string, description: string) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.userReference) {
        this.error = 'Connectez-vous pour créer votre univers.'
        return
      }
      this.loading = true
      this.error = null
      try {
        const topic = await useTopicStore().create({
          name,
          description,
          private: false,
          tags: ['hackathon-dinum-2026'],
          owner: userStore.userReference,
          organization: null,
          extras: { [useSiteId()]: {} }
        })
        this.topic = topic
        this.topicId = topic.id
        this.datasets = []
        LocalStorageService.setItem(universeTopicStorageKey, topic.id)
        this.propagateToConfig()
      } catch {
        this.error = 'Échec de la création de votre univers.'
      } finally {
        this.loading = false
      }
    },
    async addDataset(dataset: { id: string; title: string }) {
      if (!this.topicId) return
      // Guards against an already-confirmed dataset, and against a second
      // click while a request for the same id is still in flight (harmless
      // belt-and-suspenders — the real duplication bug was the aliasing
      // fixed in load() above, not a click race).
      if (this.datasets.some((d) => d.element?.id === dataset.id)) return
      if (this.pendingDatasetIds.includes(dataset.id)) return
      this.error = null
      this.pendingDatasetIds = [...this.pendingDatasetIds, dataset.id]
      try {
        const created = await useTopicElementStore().createElement(
          this.topicId,
          {
            element: { class: 'Dataset', id: dataset.id },
            title: dataset.title,
            description: null,
            tags: []
          } as unknown as GenericElement
        )
        this.datasets = [...this.datasets, created]
      } catch {
        this.error = "Échec de l'ajout du jeu de données."
      } finally {
        this.pendingDatasetIds = this.pendingDatasetIds.filter(
          (id) => id !== dataset.id
        )
      }
    },
    // Bulk-adds every dataset owned by an organization in one POST (see
    // TopicElementStore.createElements()) rather than one addDataset() call
    // per dataset. Can legitimately be slow for a large organization
    // (paginated fetch of every one of its datasets first) — the UI is
    // expected to show that via bulkAddingOrgId.
    async addOrganizationDatasets(organization: { id: string; name: string }) {
      if (!this.topicId) return
      if (this.bulkAddingOrgId) return
      this.error = null
      this.bulkAddingOrgId = organization.id
      try {
        const toAdd: Array<{ id: string; title: string }> = []
        const pageSize = 100
        // Safety cap (2000 datasets) against a runaway loop on a malformed
        // paginated response — not a realistic org size in practice.
        const maxPages = 20
        for (let page = 1; page <= maxPages; page++) {
          const response = await new SearchAPI().search('', {
            organization: organization.id,
            page,
            page_size: pageSize
          })
          for (const dataset of response.data) {
            if (!this.datasets.some((d) => d.element?.id === dataset.id)) {
              toAdd.push({ id: dataset.id, title: dataset.title })
            }
          }
          if (!response.next_page || response.data.length < pageSize) break
        }
        if (toAdd.length === 0) return
        const elements = toAdd.map(
          (dataset) =>
            ({
              element: { class: 'Dataset', id: dataset.id },
              title: dataset.title,
              description: null,
              tags: []
            }) as unknown as GenericElement
        )
        const created = await useTopicElementStore().createElements(
          this.topicId,
          elements
        )
        this.datasets = [...this.datasets, ...created]
      } catch {
        this.error = `Échec de l'ajout des jeux de données de « ${organization.name} ».`
      } finally {
        this.bulkAddingOrgId = null
      }
    },
    async removeDataset(elementId: string) {
      if (!this.topicId) return
      this.error = null
      try {
        await useTopicElementStore().deleteElement(this.topicId, elementId)
        this.datasets = this.datasets.filter((d) => d.id !== elementId)
      } catch {
        this.error = 'Échec de la suppression du jeu de données.'
      }
    },
    // Writes the topic id into config.pages.datasets.universe_query, the
    // same merge path the config editor and Albert use (see
    // utils/configMerge.ts) — validated live against the real data.gouv.fr
    // API that datasets/search/?topic=<id> actually filters by Topic
    // membership (unlike reuses, where `topic` means something else).
    propagateToConfig() {
      if (!this.topicId) return
      mergeConfigAndPersist(
        { pages: { datasets: { universe_query: { topic: this.topicId } } } },
        { prune: false }
      )
    }
  }
})
