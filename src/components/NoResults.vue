<script setup lang="ts">
defineProps({
  clearFilters: {
    type: Function as PropType<() => void>,
    required: true
  }
})
</script>

<template>
  <div
    class="fr-mt-2w rounded-xxs fr-p-3w fr-grid-row flex-direction-column bg-contrast-blue-cumulus"
  >
    <div class="fr-col fr-grid-row fr-grid-row--gutters text-blue-400">
      <div class="fr-col-auto">
        <img
          src="/search/france_with_magnifying_glass.svg"
          alt=""
          loading="lazy"
          class="w-100"
          height="134"
          width="124"
        />
      </div>
      <div
        class="fr-col-12 fr-col-sm fr-grid-row flex-direction-column justify-between"
      >
        <div class="fr-mb-1w">
          <h2 class="fr-m-0 fr-mb-1w fr-text--bold fr-text--md">
            Aucun résultat ne correspond à votre recherche
          </h2>
          <p class="fr-mt-1v fr-mb-3v">
            <slot name="description">
              Essayez de réinitialiser les filtres pour agrandir votre champ de
              recherche.
            </slot>
          </p>
        </div>
        <div class="fr-grid-row fr-grid-row--undefined">
          <button class="fr-btn" @click.stop.prevent="clearFilters">
            Réinitialiser les filtres
          </button>
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
