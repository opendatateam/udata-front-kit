<script setup>
defineProps(["title", "description", "img", "link", "altImg"])
</script>

<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <router-link :to="link">{{ title }}</router-link>
        </h3>
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
.fr-card {
  &__img {
    img {
      object-fit: contain;
    }
  }
}
</style>
