<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { capitalize, computed, onMounted, ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { toast } from 'vue3-toastify'

import DatasetPropertiesTextFields from '@/components/forms/dataset/DatasetPropertiesTextFields.vue'
import { Availability, type DatasetProperties } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useTopicsConf } from '@/utils/config'

import { useExtras } from '@/utils/bouquet'
import { useGroups } from '@/utils/bouquetGroups'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  }
})

const emit = defineEmits(['update:show'])
const loader = useLoading()
const topicStore = useTopicStore()

const { topicsName, topicsExtrasKey, topicsDatasetEditorialization } =
  useTopicsConf()

const bouquets = topicStore.myTopics
const datasetProperties = ref<DatasetProperties>({
  title: '',
  purpose: '',
  id: props.dataset.id,
  uri: `/datasets/${props.dataset.id}`,
  availability: Availability.LOCAL_AVAILABLE
})
const selectedBouquetId: Ref<string | null> = ref(null)

const bouquetOptions = computed(() => {
  return bouquets.value.map((bouquet) => {
    return {
      value: bouquet.id,
      text: bouquet.name
    }
  })
})

const isValid = computed(() => {
  if (topicsDatasetEditorialization) {
    return (
      datasetProperties.value.title.trim() !== '' &&
      datasetProperties.value.purpose.trim() !== '' &&
      !!selectedBouquetId.value
    )
  } else {
    return !!selectedBouquetId.value
  }
})

const modalActions = computed(() => {
  return [
    {
      label: 'Annuler',
      secondary: true,
      onClick: () => closeModal()
    },
    {
      label: 'Enregistrer',
      disabled: !isValid.value,
      onClick: () => submit()
    }
  ]
})

const selectedBouquet = computed(() => {
  if (selectedBouquetId.value === null) {
    return null
  }
  return topicStore.get(selectedBouquetId.value)
})

const { datasetsProperties } = useExtras(selectedBouquet)

const isDatasetInBouquet = computed(() => {
  if (!selectedBouquetId.value) {
    return false
  }
  return datasetsProperties.value.some(
    (datasetProps) => datasetProps.id === props.dataset.id
  )
})

const { groupedDatasets } = useGroups(datasetsProperties)

const groupOptions = computed(() =>
  Array.from(groupedDatasets.value, ([key]) => key)
)

const submit = async () => {
  if (selectedBouquetId.value === null) {
    throw Error('Trying to attach to topic without id')
  }
  const bouquet = topicStore.get(selectedBouquetId.value)
  if (bouquet === undefined) {
    throw Error('Topic not in store')
  }
  const newDatasetsProperties =
    bouquet.extras[topicsExtrasKey].datasets_properties || []
  newDatasetsProperties.push(datasetProperties.value)
  bouquet.extras[topicsExtrasKey].datasets_properties = newDatasetsProperties
  await topicStore.update(bouquet.id, {
    id: bouquet.id,
    tags: bouquet.tags,
    extras: bouquet.extras
  })
  toast(
    `Jeu de données ajouté avec succès au ${topicsName} "${bouquet.name}"`,
    {
      type: 'success'
    }
  )
  closeModal()
}

const closeModal = () => {
  emit('update:show', false)
}

onMounted(() => {
  const loading = loader.show()
  topicStore.loadTopicsForUniverse().then(() => loading.hide())
})
</script>

<template>
  <DsfrModal
    v-if="show"
    size="lg"
    :title="`Ajouter le jeu de données à un de vos ${topicsName}s`"
    :opened="show"
    aria-modal="true"
    @close="closeModal"
  >
    <DsfrSelect
      v-model="selectedBouquetId"
      :label="`${capitalize(topicsName)} à associer (obligatoire)`"
      :options="bouquetOptions"
      :default-unselected-text="`Choisissez un ${topicsName}`"
    >
    </DsfrSelect>
    <DsfrBadge
      v-if="isDatasetInBouquet"
      type="info"
      label="Déjà utilisé dans ce bouquet"
      small
      ellipsis
      class="fr-mb-2w"
    />
    <DatasetPropertiesTextFields
      v-if="topicsDatasetEditorialization"
      v-model:dataset-properties-model="datasetProperties"
    />
    <div class="fr-input-group">
      <label for="input-regroupement">Regroupement (facultatif)</label>
      <p id="regroupement-description" class="fr-mt-1v fr-mb-2v fr-text--sm">
        Rechercher ou créer un regroupement. Un regroupement contient un ou
        plusieurs jeux de données.
      </p>
      <Multiselect
        id="input-regroupement"
        v-model="datasetProperties.group"
        :options="groupOptions"
        :searchable="true"
        :limit="5"
        :strict="false"
        no-options-text="Il n'y a pas encore de regroupement dans ce bouquet."
        no-results-text="Aucun regroupement existant."
        :create-option="true"
        name="select"
        placeholder=""
        :aria="{
          'aria-describedby': 'regroupement-description'
        }"
      >
        <template #option="{ option }">
          <p v-if="option.__CREATE__">
            Ajouter "{{ option.label }}" comme regroupement
          </p>
          <p v-else>{{ option.label }}</p>
        </template>
      </Multiselect>
    </div>
    <slot name="footer">
      <DsfrButtonGroup
        v-if="modalActions?.length"
        align="right"
        :buttons="modalActions"
        inline-layout-when="large"
      />
    </slot>
  </DsfrModal>
</template>

<style scoped>
.fr-select-group:has(+ .fr-badge) {
  margin-bottom: 0.5rem;
}
</style>
