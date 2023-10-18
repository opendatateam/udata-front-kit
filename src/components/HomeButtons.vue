<script setup>
const props = defineProps(['buttons'])
const buttons = props.buttons

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <div>
    <br /><br />
    <div
      style="display: flex; justify-content: center; align-items: flex-start"
    >
      <div
        v-for="but in buttons"
        :key="but.name"
        class="button-home"
        @click="goToPage(but.link)"
      >
        <img :src="but.img" width="70" />
        <p class="button-name">{{ but.title }}</p>
      </div>
    </div>
    <br />
  </div>
</template>

<style scoped lang="scss">
.button-home {
  width: 200px;
  height: 150;
  margin-left: 30px;
  margin-top: 30px;
  padding-top: 10px;
}
.button-home:hover {
  background-color: #ebebeb;
  cursor: pointer;
}
.button-name {
  color: #060091;
}
</style>
