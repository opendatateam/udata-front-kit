<script setup lang="ts">
import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr'

export type TabWithCount = DsfrTabItemProps & {
  title: string
  count?: number
}

defineProps<{
  tabs: TabWithCount[]
  tabListName: string
}>()

const activeTab = defineModel<number>({ required: true })
</script>

<template>
  <DsfrTabs v-model="activeTab" :tab-list-name="tabListName">
    <template #tab-items>
      <DsfrTabItem
        v-for="(tab, index) in tabs"
        :key="tab.tabId"
        :tab-id="tab.tabId"
        :panel-id="tab.panelId"
        :icon="tab.icon"
        @click="activeTab = index"
        @next="activeTab = index === tabs.length - 1 ? 0 : index + 1"
        @previous="activeTab = index === 0 ? tabs.length - 1 : index - 1"
        @first="activeTab = 0"
        @last="activeTab = tabs.length - 1"
      >
        {{ tab.title }}
        <sup v-if="tab.count !== undefined" class="tab-count fr-ml-1v">
          ({{ tab.count }})
        </sup>
      </DsfrTabItem>
    </template>
    <slot />
  </DsfrTabs>
</template>

<style scoped>
.tab-count {
  font-weight: normal;
  /* .fr-tabs__tab is display:inline-flex, which makes vertical-align a no-op on its children */
  position: relative;
  top: -0.4em;
}
</style>
