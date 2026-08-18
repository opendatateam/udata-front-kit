<script setup lang="ts">
import { computed } from 'vue'

import type { NetworkConf } from '@/model/config'

const props = defineProps<{
  slug: string
  network: NetworkConf
  headingLevel: 'h2' | 'h3' | 'h4' | 'h5'
}>()

// The first page listed for a network is used as the network's display identity
const defaultSubpath = computed(() => Object.keys(props.network.pages)[0])
const defaultPage = computed(() => props.network.pages[defaultSubpath.value])
const name = computed(() => defaultPage.value.title)
const to = computed(() => ({
  name: `${props.slug}__${defaultSubpath.value}`
}))
</script>

<template>
  <div class="contributor-tile fr-enlarge-link border">
    <div class="fr-grid-row fr-grid-row--middle fr-mb-8v">
      <div v-if="defaultPage.banner?.logo" class="fr-col-auto">
        <div class="fr-tile__img border fr-p-3v fr-m-0">
          <img
            :src="defaultPage.banner.logo"
            alt=""
            loading="lazy"
            class="fr-responsive-img"
          />
        </div>
      </div>
      <div class="fr-col fr-px-3v">
        <component :is="headingLevel" class="fr-title-v2__title fr-m-0 h4">
          <RouterLink class="fr-tile__link" :to="to">
            {{ name }}
          </RouterLink>
        </component>
      </div>
    </div>
    <div v-if="defaultPage.banner?.content" class="contributor-tile__body">
      <p class="fr-tile__desc">
        <text-clamp
          :auto-resize="true"
          :text="defaultPage.banner.content"
          :max-lines="3"
        />
      </p>
    </div>
  </div>
</template>

<style scoped>
.fr-tile__img {
  background-color: var(--background-default-grey);
}

.fr-tile__link {
  color: var(--text-default-grey);
}
</style>
