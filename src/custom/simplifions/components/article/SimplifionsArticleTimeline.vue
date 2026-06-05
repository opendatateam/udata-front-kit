<template>
  <ol class="timeline" role="list">
    <slot />
  </ol>
</template>

<script setup lang="ts">
</script>

<style scoped>
.timeline {
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 4.625rem;
  top: 0.5rem;
  bottom: 1rem;
  width: 2px;
  background-color: var(--border-default-grey);
}

:deep(li) {
  position: relative;
  padding: 0 0 2rem 6.5rem;
  min-height: 2.5rem;
}

/* La date doit être un élément <time> comme premier enfant du <li> */
:deep(li > time:first-child) {
  display: block;
  position: absolute;
  left: 0;
  top: 0.1rem;
  width: 3.75rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5rem;
  color: var(--text-title-blue-france);
}

/* Point de repère sur la ligne verticale — purement décoratif */
:deep(li)::after {
  content: "";
  position: absolute;
  left: 4.125rem;
  top: 0.3rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: var(--background-action-high-blue-france);
  border: 2px solid var(--background-default-grey);
  box-sizing: border-box;
}

:deep(li:last-child) {
  padding-bottom: 0;
}

:deep(li) p {
  margin: 0 0 0.25rem;
  line-height: 1.6;
}

:deep(li) .timeline-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-inverted-blue-france);
  background-color: var(--background-action-high-blue-france);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
  margin-bottom: 0.35rem;
}

:deep(li) .timeline-tag--eu {
  background-color: var(--background-action-high-purple-glycine);
}

:deep(li) .timeline-tag--rapport {
  color: var(--text-default-grey);
  background-color: var(--background-alt-beige-gris-galet);
}
</style>
