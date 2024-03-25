<script setup>
const props = defineProps(['topicsData', 'urlHighlightedTopics'])
</script>

<template>
  <br />
  <div style="display: flex; flex-wrap: wrap">
    <span v-for="topic in topicsData" v-bind:key="topic.id">
      <DsfrCard
        style="width: 350px; margin-right: 30px; margin-bottom: 50px"
        alt-img="altImg"
        :description="topic.extras['udata-front-kit:short_description']"
        :img-src="topic.extras['udata-front-kit:topic_image']"
        :link="'/' + urlHighlightedTopics + '?topic=' + topic.id"
        :title="topic.name"
      />
    </span>
  </div>
</template>
