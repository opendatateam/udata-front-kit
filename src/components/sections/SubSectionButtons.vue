<script setup lang="ts">
defineProps({
  subsection: {
    type: Object,
    required: true
  }
})

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <div class="subsection-buttons">
    <div v-for="item in subsection" v-bind:key="item" class="subsection-button">
      <button @click="goToPage(item.url)" :class="item.class">
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
