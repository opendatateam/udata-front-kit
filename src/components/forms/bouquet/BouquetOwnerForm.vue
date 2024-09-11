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

const userStore = useUserStore()
const { topicsName } = useTopicsConf()

const choice: Ref<'organization' | 'owner'> = ref(
  topic.value.organization != null ? 'organization' : 'owner'
)

const selectedAnyOrganization: Ref<Organization | undefined> = ref(undefined)
const selectedOwnOrganization: Ref<string | undefined> = ref(undefined)

const radioOptions = [
  {
    label: 'En votre propre nom',
    value: 'owner'
  },
  {
    label: "En tant qu'organisation",
    value: 'organization'
  }
]
const selectOptions = computed(() => {
  const options = organizations.value.map((option, index) => {
    return { value: index, text: option.name }
  })
  return options
})

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

const onSelectOwnOrganization = () => {
  if (selectedOwnOrganization.value) {
    const idx = parseInt(selectedOwnOrganization.value)
    topic.value.organization = organizations.value[idx]
    topic.value.owner = null
    clear()
  }
}
const onSelectAnyOrganization = () => {
  if (selectedAnyOrganization.value) {
    topic.value.organization = selectedAnyOrganization.value
    topic.value.owner = null
    selectedOwnOrganization.value = undefined
  }
}

const clear = () => {
  selectedAnyOrganization.value = undefined
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
    <DsfrRadioButtonSet
      required="true"
      v-model="choice"
      :options="radioOptions"
      :legend="`Choisissez si vous souhaitez gérer ce ${topicsName}&nbsp;:`"
    />
    <fieldset
      v-if="choice === 'organization'"
      class="fr-fieldset organizations"
    >
      <div class="fr-fieldset__element">
        <DsfrSelect
          v-model="selectedOwnOrganization"
          label="Organisations dont vous faites partie."
          defaultUnselectedText="Sélectionnez une ogranisation"
          id="ownerOrg"
          :options="selectOptions"
          @update:modelValue="onSelectOwnOrganization()"
        />
      </div>
      <div class="fr-fieldset__element">
        <label class="fr-mt-2v" for="any-org-select-bouquet"
          >Cherchez une autre organisation.</label
        >
        <Multiselect
          v-if="userStore.isAdmin"
          id="any-org-select-bouquet"
          ref="multiselect"
          v-model="selectedAnyOrganization"
          :options="options"
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
          @select="onSelectAnyOrganization()"
          role="search"
        >
          <template #caret>
            <div
              v-if="selectedAnyOrganization"
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
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.organizations {
  gap: 1rem;
}
</style>
