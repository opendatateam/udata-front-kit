<!-- FIXME: use datagouv-components/src/components/ResourceAccordion/Swagger.vue when new datagouv-components are used -->

<template>
  <div id="swagger-ui" />
</template>

<script setup lang="ts">
import SwaggerUI from 'swagger-ui'
import 'swagger-ui-themes/themes/3.x/theme-newspaper.css'
import 'swagger-ui/dist/swagger-ui.css'
import { onMounted } from 'vue'

const props = defineProps<{
  url: string
}>()

onMounted(async () => {
  SwaggerUI({
    dom_id: '#swagger-ui',
    url: props.url
  })
})
</script>

<style>
.swagger-ui .opblock-tag small,
.swagger-ui .opblock .opblock-summary-description,
.swagger-ui .opblock-description-wrapper,
.swagger-ui .opblock-description-wrapper h4,
.swagger-ui .opblock-title_normal,
.swagger-ui .opblock-title_normal h4,
.swagger-ui .opblock-description-wrapper p,
.swagger-ui .opblock-title_normal p,
.swagger-ui .responses-inner h4,
.swagger-ui .responses-inner h5,
.swagger-ui .response-col_status,
.swagger-ui .dialog-ux .modal-ux-content p,
.swagger-ui table thead tr td,
.swagger-ui table thead tr th,
.swagger-ui .parameters-col_description p,
.swagger-ui .info p,
.swagger-ui .info a,
.swagger-ui .info .title,
.swagger-ui .topbar {
  font-family: 'Marianne', Arial, sans-serif !important;
}
</style>
