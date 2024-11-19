<script setup lang="ts">
import hackathonImg from '../assets/hackathonda.png'

const goToPage = (page: string) => {
  window.location.href = '/hackathons/hackathon-donnees-alimentaires'
}
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">
        Hackathon
        <br />
        Données Alimentaires
      </h1>
    </section>
    <section class="fr-container fr-pt-12v">
      <div class="banner" @click="goToPage()">
        <div>
          <img :src="hackathonImg" width="300" />
        </div>
        <div class="banner-text">
          Bienvenue sur le site du hackathon organisé par la direction
          interministérielle du numérique (DINUM) et le ministère de
          l’Agriculture, de la Souveraineté alimentaire et de la Forêt, en
          partenariat avec Open Food Facts et FranceAgrimer.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bouquets,
.faq {
  background-color: #f6f6f6;
}
.illustration {
  max-width: 100%;
}
.organize-data {
  background-color: white;
  padding: 2rem 0;

  li {
    border-right: 1px solid var(--border-default-grey);
    padding-right: 1rem;
  }

  li:last-child {
    border: none;
  }

  @media (max-width: 992px) {
    & {
      padding: 1rem;
    }

    h3 {
      margin: 1rem 0 0.5rem;
    }

    li {
      border-right: none;
      border-bottom: 1px solid var(--border-default-grey);
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }

    li:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  h4 {
    margin-top: 5px;
  }

  p {
    margin-bottom: 0;
  }
}

:deep(.fr-links-group) {
  li {
    display: block;
  }

  li a {
    color: var(--text-action-high-blue-france);
  }

  li a::after {
    content: ' →';
    margin-left: 0.5rem;
  }

  .fr-link {
    /* Overide style for external link */
    font-size: inherit;
    margin: inherit;
    vertical-align: inherit;
  }
}

:deep(.fr-card__content) {
  padding-left: 1rem;
  padding-bottom: 0;

  .fr-card__desc {
    font-size: 1rem;
  }
}
:deep(.fr-card--sm .fr-card__footer) {
  padding: 0 0 2rem;
}

.explore-contribute :deep(.fr-card__body) {
  padding-left: 1.5rem;
}
.explore-contribute .fr-grid-row--gutters .fr-col-12 {
  padding: 1.75rem;
}

:deep(.fr-card__header) {
  flex: 0 0 33%;

  .fr-card__img img {
    object-fit: contain;
    object-position: bottom;
  }
}

.explorer :deep(.fr-card__img) {
  overflow: hidden;
}
.explorer :deep(.fr-card__img img) {
  object-position: -25px 65%;
  transform: scale(1.3);
}

@media (max-width: 768px) {
  :deep(.fr-card__header) {
    flex: 0 0 25%;
  }

  :deep(.fr-card__header .fr-card__img) {
    height: 120px;
    overflow: hidden;
  }

  :deep(.fr-card__header .fr-card__img img) {
    object-position: left bottom;
    transform: inherit;
  }

  .explorer :deep(.fr-card__img img) {
    position: relative;
    top: 25%;
    left: 1rem;
    height: 65%;
  }

  .contribute :deep(.fr-card__img img) {
    position: relative;
    left: 1rem;
    height: 120%;
  }
}
.main-title-v2 {
  text-align: center;
  font-size: clamp(1.375rem, 0.4698rem + 4.5259vw, 4rem);

  @media (max-width: 768px) {
    text-align: inherit;
  }
}
.main-title-v2 :deep(.highlight) {
  color: #000091;
}

.big-search {
  max-width: 792px;
  margin: 0 auto;
}

.banner {
  cursor: pointer;
  border: 1px solid #bbbbbb;
  display: flex;
  align-items: center;
}

.banner-text {
  margin-left: 20px;
  font-size: 18px;
}
</style>
