<script lang="ts" setup>
import VIconDsfr from '@/components/VIconDsfr.vue'

defineProps({
  inputName: { type: String, required: true },
  errorMessage: { type: String, required: true }
})
</script>

<template v-if="errorMessage">
  <p :id="`errors-${inputName}`" class="error">
    <VIconDsfr name="error-fill" />
    {{ errorMessage }}
  </p>
</template>
