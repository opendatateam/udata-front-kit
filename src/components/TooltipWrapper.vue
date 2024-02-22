<script setup>
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { Tippy } from 'vue-tippy'

defineProps({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <tippy theme="light">
    <VIcon
      name="ri-question-fill"
      color="var(--blue-france-sun-113-625)"
      style="margin-left: 0.2em"
    />
    <template #content>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="text"></span>
    </template>
  </tippy>
</template>
