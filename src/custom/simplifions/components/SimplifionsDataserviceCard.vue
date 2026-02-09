<template>
  <div class="fr-my-2w fr-p-2w border border-default-grey fr-enlarge-link">
    <div
      v-if="dataservice.access_type === 'restricted'"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p class="fr-badge fr-badge--sm fr-badge--info fr-mr-1w">
        <span class="fr-icon-lock-line fr-icon--sm" aria-hidden="true"></span>
        API restreinte
      </p>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <div class="logo">
          <Placeholder
            v-if="dataservice.organization"
            type="Organization"
            :src="dataservice.organization.logo_thumbnail"
            alt=""
            :size="40"
          />
          <Placeholder v-else type="Organization" :size="40" />
        </div>
      </div>
      <div class="fr-col-12 fr-col-sm">
        <component :is="props.titleTag" class="fr-text--md fr-mb-0 fr-grid-row">
          <!-- External link (string URL) -->
          <a
            v-if="typeof dataserviceUrl === 'string'"
            :href="dataserviceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-grey-500 fr-grid-row"
          >
            <TextClamp
              class="fr-col"
              :auto-resize="true"
              :text="dataservice.title"
              :max-lines="1"
            />
          </a>
          <!-- Internal link (router object) -->
          <RouterLink
            v-else
            :to="dataserviceUrl"
            class="text-grey-500 fr-grid-row"
          >
            <TextClamp
              class="fr-col"
              :auto-resize="true"
              :text="dataservice.title"
              :max-lines="1"
            />
          </RouterLink>
        </component>
        <div
          v-if="dataservice.organization"
          class="fr-text--sm fr-m-0 inline-flex"
        >
          <span class="not-enlarged fr-mr-1v">
            <OrganizationNameWithCertificate
              :organization="dataservice.organization"
            />
          </span>
          <span class="text-mention-grey dash-before-sm whitespace-nowrap"
            >Mise à jour
            {{
              formatRelativeIfRecentDate(dataservice.metadata_modified_at)
            }}</span
          >
        </div>
        <div
          v-if="
            dataservice.availability !== undefined ||
            (dataservice.metrics &&
              (dataservice.metrics.views || dataservice.metrics.followers))
          "
          class="fr-mt-1v fr-grid-row fr-grid-row--middle fr-text--sm text-mention-grey"
        >
          <div
            v-if="dataservice.availability"
            class="fr-mr-1v flex-sm dash-after-sm"
          >
            <span class="fr-mr-1v"
              >Disponibilité :
              {{ formatAvailability(dataservice.availability) }}</span
            >
          </div>
          <div
            v-if="dataservice.metrics"
            class="fr-grid-row fr-grid-row--middle"
          >
            <div
              v-if="dataservice.metrics.views"
              class="fr-mr-1w fr-grid-row fr-grid-row--middle"
              :aria-label="`${dataservice.metrics.views} vues`"
            >
              <span
                class="fr-icon-eye-line fr-icon--sm fr-mr-1v"
                aria-hidden="true"
              ></span>
              <span>{{ summarize(dataservice.metrics.views) }}</span>
            </div>
            <div
              v-if="dataservice.metrics.followers"
              class="fr-grid-row fr-grid-row--middle"
              :aria-label="`${dataservice.metrics.followers} abonnés`"
            >
              <span
                class="fr-icon-star-line fr-icon--sm fr-mr-1v"
                aria-hidden="true"
              ></span>
              <span>{{ summarize(dataservice.metrics.followers) }}</span>
            </div>
          </div>
        </div>
        <p
          v-if="dataservice.description"
          class="fr-mt-1w fr-mb-1w fr-hidden fr-unhidden-sm overflow-wrap-anywhere fr-text--sm"
        >
          <TextClamp
            :auto-resize="true"
            :text="stripFromMarkdown(dataservice.description)"
            :max-lines="2"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { stripFromMarkdown } from '@/utils'
import {
  OrganizationNameWithCertificate,
  Placeholder,
  summarize,
  useFormatDate,
  type Dataservice
} from '@datagouv/components-next'
import type { RouteLocationRaw } from 'vue-router'
import TextClamp from 'vue3-text-clamp'

interface Props {
  dataservice: Dataservice
  dataserviceUrl: string | RouteLocationRaw
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const props = withDefaults(defineProps<Props>(), {
  titleTag: 'h4'
})

const { formatRelativeIfRecentDate } = useFormatDate()

const formatAvailability = (availability: number): string => {
  if (availability) {
    return `${availability}%`
  } else {
    return 'inconnue'
  }
}
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-default-grey {
  border: 1px solid var(--border-default-grey);
}

.text-grey-500 {
  color: var(--text-default-grey);
}

.text-mention-grey {
  color: var(--text-mention-grey);
}

.dash-before-sm::before {
  content: '—';
  margin-right: 0.5rem;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.not-enlarged {
  transform: none !important;
}

.inline-flex {
  display: inline-flex;
  align-items: center;
}

.absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
