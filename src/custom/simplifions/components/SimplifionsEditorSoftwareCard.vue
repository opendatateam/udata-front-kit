<template>
  <router-link
    :to="{
      name: 'solutions_detail',
      params: { item_id: datagouvSlug }
    }"
  >
    <div class="solution-editeur fr-py-2w">
      <div class="fr-px-4w">
        <strong>{{ solution.fields.Nom }}</strong
        ><br />
        <span class="fr-text--xs"
          >par {{ solution.fields.Nom_de_l_operateur[0] }}</span
        >
      </div>
      <div class="fr-pr-1w">
        <span
          aria-hidden="true"
          class="fr-icon-arrow-right-line fr-icon--sm"
        ></span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import TopicsAPI from '@/services/api/resources/TopicsAPI.ts'
import type { SolutionRecord } from '../model/grist'

const props = defineProps<{
  solution: SolutionRecord
}>()

const datagouvSlug = ref<string | undefined>(undefined)

const topicsAPI = new TopicsAPI({ version: 2 })
const solutionTag = `simplifions-v2-solutions-${props.solution.id}`
topicsAPI.getTopicByTag(solutionTag).then((topic) => {
  datagouvSlug.value = topic?.slug
})
</script>

<style scoped>
.solution-editeur {
  background-color: white;
  border-bottom: 4px solid rgb(53, 88, 162);
  color: black;
  display: flex;
  align-items: center;
}

.solution-editeur:hover {
  background-color: #e9e9e9;
}

.solution-editeur .fr-icon-arrow-right-line {
  color: rgb(53, 88, 162);
}
</style>
