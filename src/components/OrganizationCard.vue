<script setup lang="ts">
import { PropType } from 'vue'
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
  tags: {
    type: Array,
    default: undefined
  },
  certified: {
    type: Boolean,
    default: false
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
  <div class="fr-tile-v2 border">
    <div class="fr-grid-row fr-grid-row--middle fr-mb-8v">
      <div class="fr-col-auto">
        <div v-if="img" class="fr-tile__img border fr-p-3v fr-m-0">
          <img :src="img" alt="" loading="lazy" class="fr-responsive-img" />
        </div>
      </div>
      <div class="fr-col fr-px-3v">
        <h4 class="fr-title-v2__title">
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
    <div v-if="tags">
      <template v-for="(tag, index) in tags" :key="index">
        <DsfrTag class="fr-card__detail fr-mt-1w fr-mb-1w card__tag">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="tag" />
        </DsfrTag>
      </template>
    </div>
  </div>
</template>

<style scoped>
.fr-tile-v2 {
  padding: 2rem;
  box-shadow: 0px 4px 0px var(--border-active-blue-france);
  height: 100%;
}

.fr-title-v2__title a {
  background-image: none;
}

.card__tag {
  background-color: red;
  background-color: var(--background-contrast-info);
}
</style>
