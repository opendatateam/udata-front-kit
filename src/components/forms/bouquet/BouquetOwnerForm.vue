<script setup lang="ts">
import { defineModel, computed, ref, watch, type Ref } from 'vue'

import config from '@/config'
import type { Topic } from '@/model/topic'
import { useUserStore } from '@/store/UserStore'

const topic = defineModel({
  type: Object as () => Topic,
  required: true
})

const userStore = useUserStore()

const choice: Ref<'organization' | 'owner'> = ref(
  topic.value.organization != null ? 'organization' : 'owner'
)
const organizations = computed(() => userStore.data?.organizations || [])

const topicName = ref(config.website.topics.topic_name.name)

const onSelectOrganization = (value: string) => {
  const idx = parseInt(value)
  topic.value.organization = organizations.value[idx]
  topic.value.owner = null
}

watch(choice, () => {
  if (choice.value === 'owner' && userStore.data?.id) {
    topic.value.owner = userStore.data
    topic.value.organization = null
  }
})
</script>

<template>
  <div>
    <label class="fr-label" for="owner"
      >Choisissez si vous souhaitez gérer ce {{ topicName }}&nbsp;:</label
    >
    <fieldset id="owner" class="fr-fieldset">
      <div class="fr-fieldset__content" role="radiogroup">
        <DsfrRadioButton
          v-model="choice"
          name="owner"
          value="owner"
          label="En votre propre nom"
        />
        <div>
          <DsfrRadioButton
            v-model="choice"
            :disabled="organizations.length === 0"
            name="organization"
            value="organization"
            label="En tant qu'organisation"
          />
          <div v-if="choice === 'organization'">
            <select
              class="fr-select"
              @change="
                onSelectOrganization(($event.target as HTMLInputElement)?.value)
              "
            >
              <option selected disabled value="">
                Choisissez une organisation
              </option>
              <option
                v-for="(org, idx) in organizations"
                :key="idx"
                :selected="topic.organization?.id === org.id"
                :value="idx"
              >
                {{ org.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>
