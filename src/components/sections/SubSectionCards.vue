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
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="item in subsection.cards"
        :key="item"
        :class="['fr-col', subsection.class || 'fr-col-md-4']"
      >
        <DsfrCard
          alt-img="altImg"
          :description="item.description"
          :img-src="item.image_url"
          :link="item.url"
          :title="item.name"
        />
      </div>
    </div>
  </div>
</template>
