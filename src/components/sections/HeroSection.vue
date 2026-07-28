<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    imageUrl?: string
    altImg?: string
    colors?: string[]
  }>(),
  {
    description: '',
    imageUrl: '',
    altImg: '',
    colors: () => ['#e3e3fd', '#d4edc9']
  }
)

const gradientStyle = computed(() => ({
  background: `linear-gradient(90deg, ${props.colors.join(', ')})`
}))
</script>

<template>
  <section class="hero-section" :style="gradientStyle">
    <div class="fr-container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">{{ title }}</h1>
          <p v-if="description" class="hero-description">
            {{ description }}
          </p>
          <slot name="search" />
        </div>
        <div v-if="imageUrl" class="hero-image">
          <img :src="imageUrl" :alt="altImg" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding: 3.5rem 0;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.hero-text {
  flex: 1 1 auto;
  min-width: 0;
}

.hero-title {
  color: var(--light-decisions-text-text-title-grey, #161616);
  font-family: Marianne;
  font-size: 56px;
  font-style: normal;
  font-weight: 700;
  line-height: 64px;
}

.hero-description {
  color: var(--light-decisions-text-text-title-grey, #161616);
  font-family: Spectral;
  font-size: 24px;
  font-style: italic;
  font-weight: 400;
  line-height: 32px; /* 133.333% */
}

.hero-image {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}

.hero-image img {
  height: 384px;
  width: auto;
  display: block;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-image {
    display: none;
  }

  .hero-title {
    font-size: 1.75rem;
  }
}
</style>
