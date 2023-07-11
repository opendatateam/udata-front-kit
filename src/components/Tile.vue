<script setup>
import { computed } from 'vue'

const props = defineProps(["title", "description", "img", "link", "type", "externalLink"])

const typeClass = computed(() => !!props.type && `es-card--${props.type}`)
</script>

<template>
  <div :class="['fr-tile', 'fr-enlarge-link', typeClass]">
    <div class="fr-tile__body">
      <h4 class="fr-tile__title">
        <a v-if="externalLink" class="fr-tile__link" target="_blank" :href="externalLink">
          {{ title }}
        </a>
        <RouterLink v-else class="fr-tile__link" :to="link">
          {{ title }}
        </RouterLink>
      </h4>
      <p v-if="description" class="fr-tile__desc">
        <text-clamp v-if="description" :auto-resize="true" :text="description" :max-lines="3" />
      </p>
    </div>
    <div v-if="img" class="fr-tile__img">
      <img :src="img" class="fr-responsive-img" alt="">
    </div>
  </div>
</template>
