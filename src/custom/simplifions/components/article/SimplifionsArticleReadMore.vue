<template>
  <div class="fr-callout fr-callout--beige-gris-galet fr-my-4w fr-p-2w">
  
    <p v-if="description" class="fr-callout__text fr-text--sm">
      <strong>Lire plus</strong> • {{ description }}
    </p>
    <router-link
      :to="to"
      class="fr-link fr-link--sm fr-icon-article-line fr-link--icon-left"
    >
      {{ articleTitle }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  to: string
  description?: string
}>()

const router = useRouter()
const articleTitle = router.resolve(props.to).meta.title as string
</script>
