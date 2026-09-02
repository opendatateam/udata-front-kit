<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import EntityTypeBadges from '@/components/EntityTypeBadges.vue'
import LogoBox from '@/components/LogoBox.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import { useTopicStore } from '@/store/TopicStore'
import { useNetworksConf, useNetworksTag } from '@/utils/config'

const props = defineProps<{
  datasetId: string
}>()

const networksTag = useNetworksTag()
const networksConf = useNetworksConf()

interface MatchedNetwork {
  slug: string
  title: string
  logo?: string
  to: { name: string }
}

// map a network's configured universe topic id to its display info, so a
// topic id returned by the API can be resolved back to a network to link to
const networksByTopicId = computed(() => {
  const map = new Map<string, MatchedNetwork>()
  for (const [slug, network] of Object.entries(networksConf)) {
    const defaultSubpath = Object.keys(network.pages)[0]
    const defaultPage = network.pages[defaultSubpath]
    const topicId = defaultPage.universe_query?.topic
    if (topicId !== undefined) {
      map.set(String(topicId), {
        slug,
        title: defaultPage.title,
        logo: defaultPage.banner?.logo,
        to: { name: `${slug}__${defaultSubpath}` }
      })
    }
  }
  return map
})

const networks = ref<MatchedNetwork[]>([])

onMounted(async () => {
  if (!networksTag || networksByTopicId.value.size === 0) return

  try {
    const topics = await useTopicStore().loadForDataset(
      props.datasetId,
      networksTag
    )
    networks.value = topics
      .map((topic) => networksByTopicId.value.get(topic.id))
      .filter((network) => network !== undefined)
  } catch (error) {
    console.error('Failed to fetch dataset networks', error)
  }
})
</script>

<template>
  <SidebarItem v-if="networks.length > 0" id="networks" term="Réseaux">
    <div
      v-for="network in networks"
      :key="network.slug"
      class="fr-grid-row fr-grid-row--middle network-row"
    >
      <LogoBox v-if="network.logo" :src="network.logo" class="fr-mr-1-5v" />
      <p class="fr-col fr-m-0 min-width-0">
        <RouterLink class="fr-link network-link" :to="network.to">
          <EntityTypeBadges public-service certified>{{
            network.title
          }}</EntityTypeBadges>
        </RouterLink>
      </p>
    </div>
  </SidebarItem>
</template>

<style scoped>
.network-row + .network-row {
  margin-top: 0.375rem; /* fr-mt-1-5v */
}

/* DSFR underlines [href] elements via a --underline-idle/hover-width
   background trick, not text-decoration; SidebarOwner avoids it because its
   anchor's child is block-level, which we don't have here, so disable it
   explicitly to match the "Producteur" block's unlined look. The hover
   variant needs the `a` type selector to outrank core.css's own
   `a[href]:hover { --underline-hover-width: ... }` rule. */
.network-link {
  --underline-idle-width: 0;
}

a.network-link:hover,
a.network-link:active {
  --underline-hover-width: 0;
}
</style>
