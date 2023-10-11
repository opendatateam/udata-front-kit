<script setup>
import LineChart from "./LineChart.vue"

const props = defineProps(["chartData"])
const chartData = props.chartData
</script>

<template>
  <div>
    <div v-for="item in chartData" v-bind:key="item">
      <br /><br />
      <h2 style="text-align: left">{{ item.name }}</h2>
      <p style="text-align: left">{{ item.description }}</p>
      <div
        v-if="item.charts"
        style="
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        "
      >
        <div
          v-for="chart in item.charts"
          v-bind:key="chart.url"
          style="width: 40%"
        >
          <LineChart :dataurl="chart.url" />
        </div>
      </div>
    </div>
  </div>
</template>
