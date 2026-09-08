<script setup lang="ts">
import EntityTypeBadges from '@/components/EntityTypeBadges.vue'
import { stripFromMarkdown } from '@/utils'

const props = defineProps({
  organization: {
    type: Object,
    required: true
  },
  headingLevel: {
    type: String as () => 'h2' | 'h3' | 'h4' | 'h5',
    required: true
  }
})

const isCertified = (): boolean =>
  props.organization.badges.some(
    (badge: { kind: string }) => badge.kind === 'certified'
  )

const isPublicService = (): boolean =>
  props.organization.badges.some(
    (badge: { kind: string }) => badge.kind === 'public-service'
  )
</script>

<template>
  <div class="contributor-tile fr-enlarge-link border">
    <div class="fr-grid-row fr-grid-row--middle fr-mb-8v">
      <div class="fr-col-auto">
        <div
          v-if="organization.logo"
          class="fr-tile__img border fr-p-3v fr-m-0"
        >
          <img
            :src="organization.logo"
            alt=""
            loading="lazy"
            class="fr-responsive-img"
          />
        </div>
      </div>
      <div class="fr-col fr-px-3v">
        <component :is="headingLevel" class="fr-title-v2__title fr-m-0 h4">
          <RouterLink
            class="fr-tile__link"
            :to="`/organizations/${organization.slug}`"
          >
            <EntityTypeBadges
              :public-service="isPublicService()"
              :certified="isCertified()"
              >{{ organization.name }}</EntityTypeBadges
            >
          </RouterLink>
        </component>
      </div>
    </div>

    <div v-if="organization.description" class="contributor-tile__body">
      <p class="fr-tile__desc">
        <text-clamp
          :auto-resize="true"
          :text="stripFromMarkdown(organization.description)"
          :max-lines="3"
        />
      </p>
    </div>
    <div>
      <DsfrTag class="fr-card__detail fr-mt-1w fr-mb-1w card__tag">
        <span
          ><strong>{{ organization.metrics.datasets }}</strong> jeux de
          données</span
        >
      </DsfrTag>
    </div>
  </div>
</template>

<style scoped>
.fr-tile__img {
  background-color: var(--background-default-grey);
}

.fr-tile__link {
  color: var(--text-default-grey);
}

.card__tag {
  background-color: var(--background-action-low-blue-france);
  color: var(--text-action-high-blue-france);
  font-size: 0.875rem;
}
</style>
