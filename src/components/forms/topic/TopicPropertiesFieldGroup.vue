<template>
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="topic_name">Sujet du bouquet</label>
    <input
      class="fr-input"
      type="text"
      id="topic_name"
      placeholder="Mon bouquet"
      :value="topicName"
      @input="$emit('update:topicName', $event.target.value)"
    />
  </div>
  <div class="fr-mt-1w">
    <Tooltip
      title="Objectif du bouquet"
      name="tooltip__objectif"
      text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
    />
    <Tooltip
      title="Utilisez du markdown pour mettre en forme votre texte"
      name="tooltip__markdown"
      text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
    />
    <textarea
      class="fr-input"
      type="text"
      id="topic_description"
      placeholder="Ma description"
      :value="topicDescription"
      @input="$emit('update:topicDescription', $event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import Tooltip from '../../Tooltip.vue'

export default {
  name: 'TopicPropertiesFieldGroup',
  components: {
    Tooltip: Tooltip
  },
  props: {
    topicName: {
      type: String,
      default: ''
    },
    topicDescription: {
      type: String,
      default: ''
    }
  },
  watch: {
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  },
  computed: {
    isValid() {
      return this.topicName !== '' && this.topicDescription !== ''
    },
    errorMsg() {
      return ''
    }
  }
}
</script>
