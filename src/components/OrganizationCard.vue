<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'

const props = defineProps({
  organization: {
    type: Object,
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
  <div class="fr-tile-v2 border">
    <div class="fr-grid-row fr-grid-row--middle fr-mb-8v">
      <div class="fr-col-auto">
        <div
          v-if="organization.logo"
          class="fr-tile__img border fr-p-3v fr-m-0"
        >
          <img
            :src="organization.logo"
            loading="lazy"
            class="fr-responsive-img"
          />
        </div>
      </div>
      <div class="fr-col fr-px-3v">
        <h4 class="fr-title-v2__title">
          <VIcon
            v-if="isPublicService()"
            name="ri-bank-line"
            class="fr-mr-1v badge"
          />
          <RouterLink
            class="fr-tile__link"
            :to="`/organizations/${organization.slug}` || ''"
          >
            {{ organization.name }}
          </RouterLink>
          <VIcon
            v-if="isCertified()"
            name="ri-checkbox-circle-line"
            class="fr-ml-1v badge"
          />
        </h4>
      </div>
    </div>

    <div v-if="organization.description" class="fr-tile-v2__body">
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
.fr-tile-v2 {
  padding: 2rem;
  box-shadow: 0px 4px 0px var(--border-active-blue-france);
  height: 100%;
}

.fr-title-v2__title a {
  background-image: none;
}

.fr-title-v2__title .badge {
  color: var(--blue-france-sun-113-625);
  width: 0.9rem;
}

.card__tag {
  background-color: red;
  background-color: var(--background-contrast-info);
}
</style>
