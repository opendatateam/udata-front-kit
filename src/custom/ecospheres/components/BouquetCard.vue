<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { stripFromMarkdown } from '@/utils'
import { getThemeColor, getThemeTextColor } from '@/utils/theme'

const props = defineProps({
  bouquet: {
    type: Object as () => Topic,
    required: true
  }
})

const theme: string = props.bouquet.extras['ecospheres:informations'][0].theme
const subtheme: string =
  props.bouquet.extras['ecospheres:informations'][0].subtheme

const nbData: number =
  props.bouquet.extras['ecospheres:datasets_properties']?.length ?? 0

const bouquetLink: RouteLocationRaw = {
  name: 'bouquet_detail',
  params: { bid: props.bouquet.slug }
}
</script>

<template>
  <div class="fr-card fr-enlarge-link bouquet-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <RouterLink class="fr-card__link" :to="bouquetLink">
            {{ bouquet.name }}
          </RouterLink>
        </h3>
        <p class="fr-card__desc">
          <text-clamp
            :auto-resize="true"
            :text="stripFromMarkdown(bouquet.description)"
            :max-lines="3"
          />
        </p>
        <div class="fr-card__start">
          <DsfrTag
            v-if="subtheme !== NoOptionSelected"
            :class="{
              'fr-card__detail': true,
              'fr-mt-1w': subtheme !== NoOptionSelected
            }"
            class="fr-mb-2w bold uppercase"
            :label="subtheme"
            :style="{
              backgroundColor: getThemeColor(theme),
              color: getThemeTextColor(theme)
            }"
          />
          <p v-if="bouquet.private" class="fr-card__detail">
            <DsfrTag label="Brouillon" />
          </p>
        </div>
        <div class="fr-card__end">
          <p class="fr-card__detail">
            {{
              `${nbData > 0 ? nbData : 'Aucune'} donnée${nbData > 1 ? 's' : ''}`
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bouquet-card {
  box-shadow: inset 0 0 0 1px var(--border-default-grey),
    inset 0 -0.25rem 0 0 var(--border-plain-blue-france) !important;
}
</style>
