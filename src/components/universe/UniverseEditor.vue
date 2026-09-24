<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TabsWithCounts from '@/components/TabsWithCounts.vue'
import DatasetSearchAndAdd from '@/components/universe/DatasetSearchAndAdd.vue'
import OrganizationSearchAndAdd from '@/components/universe/OrganizationSearchAndAdd.vue'
import TagSearchAndAdd from '@/components/universe/TagSearchAndAdd.vue'
import UniverseDatasetList from '@/components/universe/UniverseDatasetList.vue'
import LocalStorageService from '@/services/LocalStorageService'
import { useUniverseStore } from '@/store/UniverseStore'
import { useUserStore } from '@/store/UserStore'

// Self-contained (auth gate included): shared by UniverseManagerView.vue
// (standalone /universe) and BootstrapWizardView.vue's first step.
const userStore = useUserStore()
const universeStore = useUniverseStore()
const route = useRoute()
const router = useRouter()

// Same pattern as DiscussionsList.vue's triggerLogin(): LoginView.vue reads
// 'lastRoute' back after a successful OAuth exchange, so without this the
// wizard/universe manager would drop the user on the homepage after
// connecting instead of back where they started (e.g. /wizard).
const triggerLogin = () => {
  LocalStorageService.setItem('lastRoute', route.fullPath)
  router.push({ name: 'login' })
}

const name = ref('')
const description = ref('')

const selectedIds = computed(() =>
  universeStore.datasets
    .map((d) => d.element?.id)
    .filter((id): id is string => id !== undefined)
)

onMounted(() => {
  universeStore.init()
})

const createUniverse = () => {
  if (!name.value.trim()) return
  universeStore.create(name.value.trim(), description.value.trim())
}

const addTabs = [
  {
    title: 'Jeux de données',
    tabId: 'tab-add-datasets',
    panelId: 'panel-add-datasets'
  },
  { title: 'Organisations', tabId: 'tab-add-orgs', panelId: 'panel-add-orgs' },
  { title: 'Mots-clés', tabId: 'tab-add-tags', panelId: 'panel-add-tags' }
]
const activeAddTab = ref(0)
</script>

<template>
  <DsfrAlert
    v-if="!userStore.isLoggedIn"
    type="info"
    title="Connexion requise"
    class="fr-mb-2w"
  >
    <div>
      Connectez-vous avec votre compte data.gouv.fr pour créer et gérer votre
      univers.
    </div>
    <button type="button" class="fr-btn fr-mt-2w" @click="triggerLogin">
      Se connecter
    </button>
  </DsfrAlert>

  <template v-else>
    <DsfrAlert
      v-if="universeStore.error"
      type="error"
      :title="universeStore.error"
      class="fr-mb-2w"
    />

    <p v-if="universeStore.loading">Chargement…</p>

    <section v-else-if="!universeStore.topicId" class="universe-create fr-p-3w">
      <h2 class="fr-h6">Créer mon univers</h2>
      <div class="fr-input-group">
        <DsfrInput
          id="universe-name"
          v-model="name"
          label="Nom (obligatoire)"
          label-visible
          placeholder="Ex : Vélo en libre-service"
        />
      </div>
      <div class="fr-input-group">
        <DsfrInput
          id="universe-description"
          v-model="description"
          is-textarea
          label="Description"
          label-visible
        />
      </div>
      <button
        type="button"
        class="fr-btn"
        :disabled="!name.trim()"
        @click="createUniverse"
      >
        Créer mon univers
      </button>
    </section>

    <section v-else class="universe-manage">
      <h2 class="fr-h6">{{ universeStore.topic?.name }}</h2>
      <p v-if="universeStore.topic?.description">
        {{ universeStore.topic?.description }}
      </p>

      <UniverseDatasetList
        v-if="universeStore.datasets.length"
        :datasets="universeStore.datasets"
        @remove="universeStore.removeDataset($event)"
      />
      <p v-else class="fr-text--sm">Aucun jeu de données pour le moment.</p>

      <h2 class="fr-h6 fr-mt-3w">Ajouter des jeux de données</h2>
      <TabsWithCounts
        v-model="activeAddTab"
        tab-list-name="Ajouter à mon univers"
        :tabs="addTabs"
      >
        <DsfrTabContent panel-id="panel-add-datasets" tab-id="tab-add-datasets">
          <DatasetSearchAndAdd
            :selected-ids="selectedIds"
            :pending-ids="universeStore.pendingDatasetIds"
            @add="universeStore.addDataset($event)"
          />
        </DsfrTabContent>
        <DsfrTabContent panel-id="panel-add-orgs" tab-id="tab-add-orgs">
          <OrganizationSearchAndAdd
            :pending-org-id="universeStore.bulkAddingOrgId"
            @add="universeStore.addOrganizationDatasets($event)"
          />
        </DsfrTabContent>
        <DsfrTabContent panel-id="panel-add-tags" tab-id="tab-add-tags">
          <TagSearchAndAdd
            :pending-tag="universeStore.bulkAddingTag"
            @add="universeStore.addTaggedDatasets($event.tag, $event.datasets)"
          />
        </DsfrTabContent>
      </TabsWithCounts>
    </section>
  </template>
</template>

<style scoped>
.universe-create {
  background-color: var(--background-alt-blue-france, #f5f5fe);
  border: 1px solid var(--border-default-grey, #ddd);
}
</style>
