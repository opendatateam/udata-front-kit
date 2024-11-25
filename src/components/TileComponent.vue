<script setup lang="ts">
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

function strip(value: string) {
  if (props.isMarkdown) {
    return stripFromMarkdown(value)
  }
  return value
}
</script>

<template>
  <div class="fr-tile-v2">
    <div class="fr-grid-row fr-grid-row--middle">
      <div class="fr-col-auto">
        <div v-if="img" class="fr-tile__img border fr-p-3v fr-m-0">
          <img
            :src="img"
            alt=""
            loading="lazy"
            class="fr-responsive-img"
            style="max-width: 100%; max-height: 100%"
          />
        </div>
      </div>
      <div class="fr-col fr-px-3v">
        <h4 class="">
          <a
            v-if="externalLink"
            class="fr-tile__link"
            style="outline-width: 0"
            target="_blank"
            :href="externalLink"
          >
            {{ title }}
          </a>
          <RouterLink
            v-else
            class="fr-tile__link"
            style="outline-width: 0; background-image: none"
            :to="link || ''"
          >
            {{ title }}
          </RouterLink>
        </h4>
      </div>
    </div>

    <div class="fr-tile-v2__body">
      <p v-if="description" class="fr-tile__desc">
        <text-clamp
          v-if="description"
          :auto-resize="true"
          :text="strip(description)"
          :max-lines="3"
        />
      </p>
    </div>
    <div v-if="tags" class="fr-mb-8v">
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
.fr-tile-v2 {
  border-bottom: 4px solid var(--border-active-blue-france);
  height: 100%;
}

.card__tag {
  background-color: red;
  background-color: var(--background-contrast-info);
}
</style>
