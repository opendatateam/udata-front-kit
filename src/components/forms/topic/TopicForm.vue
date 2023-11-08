<template>
    <div class="app">
      <form @submit.prevent="handleSubmit" class="checkout-form">
        
        <h1>Step 1 : Propriété </h1>
        <TopicPropertiesFieldGroup 
            v-model:topicName="name"
            v-model:topicDescription="description"
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
  
  export default {
    name: "TopicForm",
    components: {
      TopicPropertiesFieldGroup: TopicPropertiesFieldGroup,
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
    },
    data() {
      return {
        name: this.currentName,
        description: this.currentDescription,
      }
    },
  };
</script>