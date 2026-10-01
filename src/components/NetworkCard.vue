<script setup lang="ts">
import NameWithCertificates from '@/components/NameWithCertificates.vue'
import config from '@/config'
import type { NetworkConf } from '@/model/config'
import { networkDefaultPage, networkRouteName } from '@/utils/config'

const props = defineProps<{
  slug: string
  network: NetworkConf
  headingLevel: 'h2' | 'h3' | 'h4' | 'h5'
}>()

const { subpath: defaultSubpath, page: defaultPage } = networkDefaultPage(
  props.network
)
const name = defaultPage.title
const to = { name: networkRouteName(props.slug, defaultSubpath) }
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
            <NameWithCertificates
              public-service
              certified
              :certified-by="config.website.title"
              >{{ name }}</NameWithCertificates
            >
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
