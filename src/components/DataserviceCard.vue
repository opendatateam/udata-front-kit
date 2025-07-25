<template>
  <article class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title fr-mb-1w">
          <a :href="dataserviceUrl" class="fr-card__link">
            {{ dataservice.title }}
          </a>
        </h3>
        <div class="fr-card__desc">
          <p v-if="dataservice.description" class="fr-text--sm fr-mb-1w">
            {{ truncatedDescription }}
          </p>
          <div class="fr-card__meta fr-text--xs">
            <div v-if="dataservice.organization" class="fr-mb-1v">
              <span
                class="fr-icon-account-circle-line fr-icon--sm"
                aria-hidden="true"
              ></span>
              {{ dataservice.organization.name }}
            </div>
            <div v-if="dataservice.updated_at" class="fr-text--mention-grey">
              Mis à jour le {{ formatDate(dataservice.updated_at) }}
            </div>
          </div>
        </div>
      </div>
      <div class="fr-card__footer">
        <div
          v-if="dataservice.tags && dataservice.tags.length > 0"
          class="fr-tags-group"
        >
          <p v-for="tag in displayedTags" :key="tag" class="fr-tag fr-tag--sm">
            {{ tag }}
          </p>
          <p v-if="dataservice.tags.length > maxTags" class="fr-tag fr-tag--sm">
            +{{ dataservice.tags.length - maxTags }}
          </p>
        </div>
        <div
          v-if="dataservice.is_restricted"
          class="fr-badge fr-badge--sm fr-badge--info"
        >
          API restreinte
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DataserviceV2 } from '@/model/dataservice'

interface Props {
  dataservice: DataserviceV2
  dataserviceUrl: string
  showDescription?: boolean
  maxTags?: number
  maxDescriptionLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
  maxTags: 3,
  maxDescriptionLength: 150
})

const truncatedDescription = computed(() => {
  if (!props.dataservice.description || !props.showDescription) return ''
  if (props.dataservice.description.length <= props.maxDescriptionLength) {
    return props.dataservice.description
  }
  return (
    props.dataservice.description.substring(0, props.maxDescriptionLength) +
    '...'
  )
})

const displayedTags = computed(() => {
  if (!props.dataservice.tags) return []
  return props.dataservice.tags.slice(0, props.maxTags)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.fr-card {
  background-color: var(--background-default-grey, #fff);
  margin-bottom: 1rem;
}

.fr-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fr-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fr-tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
