<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { useUserStore } from '@/store/UserStore'
import { computed, defineProps } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  },
  pageKey: {
    type: String,
    required: true
  }
})

const userStore = useUserStore()
const hasEditPermissions = computed(() =>
  userStore.hasEditPermissions(props.topic)
)

const badgeText = computed(() => {
  if (props.topic.private) {
    return 'Brouillon'
  }
  return null
})

const description = computed(() => {
  // Truncate description if it's too long
  const maxLength = 150
  if (props.topic.description && props.topic.description.length > maxLength) {
    return props.topic.description.substring(0, maxLength) + '...'
  }
  return props.topic.description
})

// Extract tags without the prefix for display
const displayTags = computed(() => {
  if (!props.topic.tags) return []

  const prefixes = ['simplifions-', 'spf-']

  return props.topic.tags
    .filter((tag: string) => prefixes.some((prefix) => tag.startsWith(prefix)))
    .map((tag: string) => {
      for (const prefix of prefixes) {
        if (tag.startsWith(prefix)) {
          return tag.replace(prefix, '').replace(/-/g, ' ')
        }
      }
      return tag
    })
    .slice(0, 3) // Limit to 3 tags for display
})
</script>

<template>
  <div class="fr-col-12 fr-col-md-6 fr-col-lg-4">
    <div class="fr-card fr-enlarge-link">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h3 class="fr-card__title">
            <RouterLink :to="`/${pageKey}/${topic.id}`">
              {{ topic.name }}
            </RouterLink>
          </h3>
          <p class="fr-card__desc">
            {{ description }}
          </p>
          <div v-if="displayTags.length > 0" class="fr-tags-group">
            <p v-for="tag in displayTags" :key="tag" class="fr-tag fr-tag--sm">
              {{ tag }}
            </p>
          </div>
        </div>
        <div class="fr-card__footer">
          <ul
            class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-sm"
          >
            <li>
              <RouterLink :to="`/${pageKey}/${topic.id}`" class="fr-btn">
                Voir le détail
              </RouterLink>
            </li>
            <li v-if="hasEditPermissions">
              <RouterLink
                :to="`/admin/${pageKey}/edit/${topic.id}`"
                class="fr-btn fr-btn--secondary"
              >
                Modifier
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="badgeText" class="fr-card__header">
        <div class="fr-badge fr-badge--blue-cumulus">
          {{ badgeText }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fr-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fr-card__content {
  flex: 1;
}

.fr-card__footer {
  margin-top: auto;
}

.fr-tags-group {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.fr-tag {
  text-transform: capitalize;
}
</style>
