<template>
  <div
    class="fr-tile fr-tile--horizontal fr-enlarge-link data-api-card"
    :disabled="disabled"
  >
    <div class="fr-tile__body">
      <div class="fr-tile__content">
        <h3 class="fr-tile__title data-api-card-title">
          <a :href="datagouvLink" :disabled="disabled">{{ title }}</a>
        </h3>
        <p class="fr-tile__detail">
          <span>{{ apiOrData.Type }}</span>

          <span v-if="disabled"> ⚠️ Lien invalide </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { SimplifionsDataOrApi } from '../model/cas_usage'

const props = defineProps<{
  apiOrData: SimplifionsDataOrApi
}>()

const entityName = props.apiOrData.Type == 'API' ? 'dataservices' : 'datasets'
const datagouvLink = ref(
  `https://www.data.gouv.fr/fr/${entityName}/${props.apiOrData.UID_data_gouv}`
)
const title = ref(props.apiOrData.Nom_donnees_ou_API)
const disabled = ref(false)

// Get the actual data from datagouv, and replace reactive properties with it if it's found
// If not found, disable the card
onMounted(async () => {
  try {
    const api = new DatagouvfrAPI({ endpoint: entityName })
    const datagouvResource = await api.request({
      url: `${api.url()}/${props.apiOrData.UID_data_gouv}`,
      method: 'get',
      params: {
        fields:
          'title,description,organization,resources,tags,created_at,updated_at'
      }
    })
    console.log(datagouvResource)
    title.value = datagouvResource.title
  } catch (error) {
    disabled.value = true
    datagouvLink.value = '#'
    console.error('Failed to fetch datagouv resource:', error)
  }
})
</script>

<style scoped>
.data-api-card[disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.data-api-card[disabled='true'] a {
  color: #666;
}

.data-api-card[disabled='true'] .fr-tile__title a:before {
  background-image: linear-gradient(0deg, #666, #666);
}

.data-api-card-title {
  height: 100%;
}

.fr-tile__detail {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
