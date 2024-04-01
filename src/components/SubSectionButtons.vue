<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
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
  <div class="datagouv-components fr-col-md-12">
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
      "
    >
      <div v-for="item in subsection" v-bind:key="item" style="margin: 10px">
        <!-- Ajoutez un peu de marge autour de chaque bouton -->
        <button @click="goToPage(item.url)" :class="item.class">
          {{ item.name }}
        </button>
      </div>
    </div>
  </div>
</template>
