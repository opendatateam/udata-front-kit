<script setup lang="ts">
import {
  useOwnerName,
  formatRelativeIfRecentDate,
  OrganizationNameWithCertificate
} from '@datagouv/components'
import { toRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { stripFromMarkdown } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useExtras } from '@/utils/bouquet'
import { useSpatialCoverage } from '@/utils/spatial'
import { getThemeColor, getThemeTextColor } from '@/utils/theme'

const props = defineProps({
  bouquet: {
    type: Object as () => Topic,
    required: true
  }
})

const bouquetRef = toRef(props, 'bouquet')
const spatialCoverage = useSpatialCoverage(bouquetRef)

const ownerName = useOwnerName(props.bouquet)

const { theme, subtheme, datasetsProperties } = useExtras(bouquetRef)

const nbData: number = datasetsProperties.value.length

const bouquetLink: RouteLocationRaw = {
  name: 'bouquet_detail',
  params: { bid: props.bouquet.slug }
}
</script>

<template>
  <article class="fr-my-3w fr-p-3w border border-default-grey fr-enlarge-link">
    <div
      v-if="bouquet.private"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v"
    >
      <p class="fr-badge fr-badge--mention-grey fr-mr-1w">Brouillon</p>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <OrganizationLogo
          v-if="bouquet.organization"
          :size="64"
          :object="bouquet"
        />
        <div v-else class="border fr-p-1-5v fr-mr-1-5v">
          <img
            style="margin-bottom: -6px"
            :src="getOwnerAvatar(bouquet)"
            height="64"
          />
        </div>
      </div>
      <div class="fr-col">
        <h4 class="fr-mb-1v fr-grid-row">
          <RouterLink :to="bouquetLink" class="text-grey-500">
            {{ bouquet.name }}
          </RouterLink>
        </h4>
        <DsfrTag
          v-if="theme && subtheme !== NoOptionSelected"
          :class="{
            'fr-card__detail': true,
            'fr-mt-1w': subtheme !== NoOptionSelected
          }"
          class="fr-mb-1w"
          :label="subtheme"
          :style="{
            backgroundColor: getThemeColor(theme),
            color: getThemeTextColor(theme)
          }"
        />
        <p
          v-if="bouquet.organization || bouquet.owner"
          class="fr-m-0 fr-text--sm"
        >
          Par
          <template v-if="bouquet.organization">
            <OrganizationNameWithCertificate
              :organization="bouquet.organization"
            />
          </template>
          <template v-else>{{ ownerName }}</template>
          — mis à jour {{ formatRelativeIfRecentDate(bouquet.last_modified) }}
        </p>
        <p
          class="fr-mt-1w fr-mb-2w fr-hidden fr-unhidden-sm overflow-wrap-anywhere"
        >
          <text-clamp
            v-if="bouquet.description"
            :auto-resize="true"
            :text="stripFromMarkdown(bouquet.description)"
            :max-lines="3"
          />
        </p>
        <p class="fr-tag">
          <VIcon name="ri-database-2-line" class="fr-mr-1v" />
          <span class="fr-mr-1v">
            {{
              `${nbData > 0 ? nbData : 'Aucune'} donnée${nbData > 1 ? 's' : ''}`
            }}
          </span>
        </p>
        <p v-if="spatialCoverage" class="fr-tag fr-ml-1w">
          <VIcon name="ri-map-2-line" class="fr-mr-1v" />
          <span class="fr-mr-1v">
            {{ spatialCoverage.name }}
          </span>
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss"></style>
