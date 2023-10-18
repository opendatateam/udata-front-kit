<script setup>
  const props = defineProps(["title", "name", "show", "text"])

</script>

<template>
  <div class="container">
    <div>
      {{ title }}
      <span class="required">&nbsp;*</span>
    </div>
    <button
      @click.prevent="show = !show"
    >
      <VIcon
        name="ri-question-fill"
        color="var(--blue-france-sun-113-625)"
        style="pointer-events: none;"
      />
    </button>
    <div class="tooltip fr-p-1w" :class="{[name]: show}">
      <p v-html="text" />
      <div class="tooltip__arrow"></div>
    </div>
    
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  position: relative;
} 
.tooltip {
  background-color: var(--grey-1000-50);
  position: absolute;
  display: none;
  width: 300px;
  box-shadow: 0px -1px 6px 0px #00000040;
  top: -12.5rem;

  &__arrow {
    width: 50px;
    height: 25px;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
    
    &::after {
     content: "";
     position: absolute;
     width: 20px;
     height: 20px;
     background: white;
     transform: translateX(-50%) translateY(-50%) rotate(45deg);
     top: 0;
     left: 50%;
     box-shadow: 1px 1px 7px 0px rgba(0,0,0,0.6);
    }
  }
}
</style>