<template>
  <ul class="checklist">
    <slot />
  </ul>
</template>

<script setup lang="ts">
</script>

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
  content: "";
  position: absolute;
  left: 1rem;
  top: 0.9rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: var(--text-default-success);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6 7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6 7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
