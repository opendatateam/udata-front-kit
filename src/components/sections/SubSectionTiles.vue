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
  <div>
    <h3 v-if="subsection.title">{{ subsection.title }}</h3>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="item in subsection.tiles"
        v-bind:key="item.id"
        :class="'fr-col-12 ' + subsection.class"
      >
        <div class="item-card" @click="goToPage(item.url)">
          <div class="item-title">{{ item.name }}</div>
          <div class="item-description">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  text-align: left;
  font-size: 20px;
}
.item-card {
  height: 100%;
  border: 1px solid #ebebeb;
  padding: 20px;
  text-align: left;
  min-height: 190px;
  border-bottom: 3px solid #3557a2;
}
.item-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  min-height: 50px;
}
.item-card:hover {
  cursor: pointer;
  background-color: #ebebeb;
}
</style>
