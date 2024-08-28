<script setup lang="ts">
import type { Organization } from '@datagouv/components'
import { debounce } from 'lodash'
import { defineModel, computed, ref, watch, type Ref, onMounted } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import '@/assets/multiselect.css'
import type { Topic } from '@/model/topic'
import SearchAPI from '@/services/api/SearchOrgAPI'
import { useUserStore } from '@/store/UserStore'
import { useTopicsConf } from '@/utils/config'

const topic = defineModel({
  type: Object as () => Topic,
  required: true
})
const selectedOrganization = defineModel('selectedOrganization', {
  type: Object as () => Topic
})

const userStore = useUserStore()
const { topicsName } = useTopicsConf()

const choice: Ref<'organization' | 'owner'> = ref(
  topic.value.organization != null ? 'organization' : 'owner'
)
const organizations = computed(() => userStore.data?.organizations || [])

const isLoading = ref(false)
const options: Ref<Organization[]> = ref([])

const search = debounce(async (query: string) => {
  isLoading.value = true
  if (!query) {
    options.value = []
    isLoading.value = false
    return
  }
  const organizations = (await new SearchAPI().search(query, 10, 1)).data
  options.value = organizations
  isLoading.value = false
}, 400)

const onSelectOrganization = (value: string) => {
  const idx = parseInt(value)
  topic.value.organization = organizations.value[idx]
  topic.value.owner = null
}

const clear = () => {
  selectedOrganization.value = undefined
}

watch(choice, () => {
  if (choice.value === 'owner' && userStore.data?.id) {
    topic.value.owner = userStore.data
    topic.value.organization = null
  }
})
</script>

<template>
  <div>
    <label class="fr-label" for="owner"
      >Choisissez si vous souhaitez gérer ce {{ topicsName }}&nbsp;:</label
    >
    <fieldset id="owner" class="fr-fieldset">
      <div class="fr-fieldset__content" role="radiogroup">
        <DsfrRadioButton
          v-model="choice"
          name="owner"
          value="owner"
          label="En votre propre nom"
        />
        <div>
          <DsfrRadioButton
            v-model="choice"
            :disabled="organizations.length === 0"
            name="organization"
            value="organization"
            label="En tant qu'organisation"
          />
          <div v-if="choice === 'organization'">
            <Multiselect
              v-if="userStore.isAdmin"
              id="bouquet-select-dataset"
              ref="multiselect"
              v-model="selectedOrganization"
              :options="options"
              label="title"
              track-by="id"
              placeholder="Ex: Lyon Métropole"
              select-label="Entrée pour sélectionner"
              :multiple="false"
              :searchable="true"
              :internal-search="false"
              :loading="isLoading"
              :clear-on-select="true"
              :close-on-select="true"
              :show-no-results="false"
              :hide-selected="true"
              @search-change="search"
            >
              <template #caret>
                <div
                  v-if="selectedOrganization"
                  class="multiselect__clear"
                  @mousedown.prevent.stop="clear"
                ></div>
              </template>
              <template #singleLabel="slotProps">
                {{ slotProps.option.name }}
              </template>
              <template #option="slotProps">
                {{ slotProps.option.name }}
              </template>
              <template #noOptions>
                Précisez ou élargissez votre recherche
              </template>
            </Multiselect>
            <select
              class="fr-select"
              @change="
                onSelectOrganization(($event.target as HTMLInputElement)?.value)
              "
            >
              <option selected disabled value="">
                Choisissez une organisation
              </option>
              <option
                v-for="(org, idx) in organizations"
                :key="idx"
                :selected="topic.organization?.id === org.id"
                :value="idx"
              >
                {{ org.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>
