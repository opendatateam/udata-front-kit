<script setup lang="ts">
import UniverseEditor from '@/components/universe/UniverseEditor.vue'
</script>

<template>
  <div class="fr-container fr-my-4w">
    <h1>Mon univers</h1>
    <p class="fr-text--sm">
      Votre univers est un
      <a
        href="https://doc.data.gouv.fr/reutilisations/topics/"
        target="_blank"
        rel="noopener"
        >Topic data.gouv.fr</a
      >
      : une sélection de jeux de données que vous gérez vous-même. Une fois
      créé, il devient automatiquement le filtre de la page « Données » de ce
      site.
    </p>

    <UniverseEditor />
  </div>
</template>
