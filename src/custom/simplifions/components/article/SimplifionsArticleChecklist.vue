<template>
  <ul class="checklist" role="list">
    <slot />
  </ul>
</template>

<script setup lang="ts"></script>

<style scoped>
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(li) {
  position: relative;
  padding: 0.875rem 1.25rem 0.875rem 3.25rem;
  margin-bottom: 0.5rem;
  background: var(--background-alt-beige-gris-galet);
  border-left: 4px solid var(--border-action-high-green-tilleul-verveine);
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-default-grey);
}

:deep(li)::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0.9rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: var(--text-default-success);
  -webkit-mask-image: url('@gouvfr/dsfr/dist/icons/system/checkbox-circle-line.svg');
  mask-image: url('@gouvfr/dsfr/dist/icons/system/checkbox-circle-line.svg');
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
