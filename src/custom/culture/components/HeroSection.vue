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
  background: `linear-gradient(135deg, ${props.colors.join(', ')})`
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
          <div class="hero-search-wrapper">
            <slot name="search" />
          </div>
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
  padding: 2.5rem 0;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.hero-text {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.hero-title {
  color: var(--light-decisions-text-text-title-grey, #161616);
  font-family: Marianne;
  font-size: 1.75rem;
  line-height: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-description {
  color: var(--light-decisions-text-text-title-grey, #161616);
  font-family: Spectral;
  font-size: 1.125rem;
  line-height: 1.625rem;
  font-style: italic;
  font-weight: 400;
  margin-bottom: 1.5rem;
}

.hero-search-wrapper {
  width: 100%;
}

.hero-image {
  flex: 0 0 35%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image img {
  width: 100%;
  height: auto;
  max-height: 384px;
  object-fit: contain;
  display: block;
}

@media (min-width: 768px) {
  .hero-section {
    padding: 3.5rem 0;
  }

  .hero-title {
    font-size: 2.5rem;
    line-height: 3rem;
  }

  .hero-description {
    font-size: 1.25rem;
    line-height: 1.875rem;
  }
}

@media (min-width: 992px) {
  .hero-section {
    padding: 4.5rem 0;
  }

  .hero-title {
    font-size: 3.5rem;
    line-height: 4rem;
  }

  .hero-description {
    font-size: 1.375rem;
    line-height: 2rem;
  }
}

@media (max-width: 767px) {
  .hero-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .hero-image {
    display: none;
  }
}
</style>
