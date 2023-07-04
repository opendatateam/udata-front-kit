<script setup>
import { computed } from 'vue'

const props = defineProps(["title", "description", "img", "link", "altImg", "type", "externalLink"])

const typeClass = computed(() => !!props.type && `es-card--${props.type}`)
</script>

<template>
  <div :class="['fr-card', 'fr-enlarge-link', typeClass]">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h6 class="fr-card__title">
          <router-link v-if="link" :to="link">{{ title }}</router-link>
          <a v-if="externalLink" :href="externalLink">{{ title }}</a>
        </h6>
        <p class="fr-card__desc">
          <text-clamp v-if="description" :auto-resize="true" :text="description" :max-lines="2" />
        </p>
      </div>
    </div>
    <div class="fr-card__header">
      <div class="fr-card__img">
        <img
          v-if="img"
          class="fr-responsive-img"
          :src="img"
          :alt="altImg"
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.es-card--dataset {
  .fr-card__header{
    width: 20%;
    flex: 0 0 20%;
  }
  h6 {
    font-size: 1em;
  }
}
.fr-card {
  &__img {
    img {
      object-fit: contain;
    }
  }
}
</style>
