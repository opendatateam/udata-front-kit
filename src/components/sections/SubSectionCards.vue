<script setup lang="ts">
defineProps({
  subsection: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div>
    <h3 v-if="subsection.title">{{ subsection.title }}</h3>
    <div style="display: flex; flex-wrap: wrap">
      <div v-for="(item, index) in subsection.cards" :key="index">
        <DsfrCard
          class="subsection-card"
          alt-img="altImg"
          :description="item.description"
          :img-src="item.image_url"
          :link="item.url"
          :title="item.name"
          :title-link-attrs="{}"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.subsection-card {
  width: 350px;
  margin-right: 30px;
  margin-bottom: 30px;
}
</style>
