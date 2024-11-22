<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { stripFromMarkdown } from '@/utils'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  link: {
    type: [Object, String] as PropType<RouteLocationRaw | string>,
    default: undefined
  },
  externalLink: {
    type: String,
    default: undefined
  },
  description: {
    type: String,
    default: undefined
  },
  img: {
    type: String,
    default: undefined
  },
  type: {
    type: String,
    default: undefined
  },
  isMarkdown: {
    type: Boolean,
    default: false
  },
  notice: {
    type: String,
    default: undefined
  },
  tags: {
    type: Array,
    default: undefined
  }
})

const typeClass = computed(() => !!props.type && `es-card--${props.type}`)

function strip(value: string) {
  if (props.isMarkdown) {
    return stripFromMarkdown(value)
  }
  return value
}
</script>

<template>
  <div :class="['fr-tile', 'fr-enlarge-link', typeClass]">
    <div class="fr-tile__body">
      <h4 class="">
        <a
          v-if="externalLink"
          class="fr-tile__link"
          target="_blank"
          :href="externalLink"
        >
          {{ title }}
        </a>
        <RouterLink v-else class="fr-tile__link" :to="link || ''">
          {{ title }}
        </RouterLink>
      </h4>
      <p v-if="description" class="fr-tile__desc">
        <text-clamp
          v-if="description"
          :auto-resize="true"
          :text="strip(description)"
          :max-lines="3"
        />
      </p>
    </div>
    <div v-if="img" class="fr-tile__img">
      <img :src="img" alt="" loading="lazy" class="fr-responsive-img" />
    </div>
    <div v-if="tags">
      <template v-for="(tag, index) in tags" :key="index">
        <DsfrTag
          class="fr-card__detail fr-mt-1w fr-mb-1w card__tag"
          :label="tag"
        />
      </template>
    </div>
    <DsfrNotice v-if="notice" :title="notice" :closeable="false" />
  </div>
</template>

<style scoped>
.fr-tile {
  border-bottom: 4px solid var(--border-active-blue-france);
}

.card__tag {
  background-color: red;
  background-color: var(--background-contrast-info);
}
</style>
