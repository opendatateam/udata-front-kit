<script setup lang="ts">
defineProps({
  subsection: {
    type: Object,
    required: true
  }
})

const goToPage = (page: string) => {
  window.location.href = page
}
</script>

<template>
  <div class="subsection-buttons">
    <div v-for="item in subsection" :key="item" class="subsection-button">
      <button :class="item.class" @click="goToPage(item.url)">
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.subsection-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.subsection-button {
  margin: 10px;
}
</style>
