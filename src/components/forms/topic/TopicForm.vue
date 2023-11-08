<template>
    <div class="app">
      <form @submit.prevent="handleSubmit" class="checkout-form">
        
        <h1>Step 1 : Propriété </h1>
        <TopicPropertiesFieldGroup 
            v-model:topicName="name"
            v-model:topicDescription="description"
        />
        <h1>Step 3 : Contenu </h1>
        <TopicContentFieldGroup 
          v-model:current-datasets="datasets"
        />         
        <DsfrButton
          type="submit"
          label="Ajouter le bouquet"
        />
        
      </form>
    </div>
  </template>
  
<script lang="ts">
  import TopicPropertiesFieldGroup from "./TopicPropertiesFieldGroup.vue";
  import TopicContentFieldGroup from "./TopicContentFieldGroup.vue";
  import TopicFormRecap from "./TopicFormRecap.vue";
  import type { DatasetItem } from "../../../model";
  
  export default {
    name: "TopicForm",
    components: {
      TopicPropertiesFieldGroup: TopicPropertiesFieldGroup,
      TopicContentFieldGroup: TopicContentFieldGroup,
      TopicFormRecap: TopicFormRecap,
    },
    methods: {
      handleSubmit() {
        console.log("formDatasets :" + this.datasets)
        alert("form submitted : " + this.name + " " + this.description);
      },
    },
    props: {
      currentName: {
        type: String,
        default: ''
      },
      currentDescription: {
        type: String,
        default: ''
      },
      currentDatasets: {
        type: Array<DatasetItem>,
        default: [],
      },
    },
    data() {
      return {
        name: this.currentName,
        description: this.currentDescription,
        datasets: this.currentDatasets
      }
    },
  };
</script>