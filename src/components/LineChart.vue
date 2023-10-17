<script setup>
import { computed, watchEffect } from "vue"
import { datavizStore } from "../store/DatavizStore"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "vue-chartjs"

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 5,
        maxRotation: 0,
        minRotation: 0,
        callback: function (val, index) {
          return (
            this.getLabelForValue(val).toString().substring(8, 10) +
            "/" +
            this.getLabelForValue(val).toString().substring(5, 7) +
            "/" +
            this.getLabelForValue(val).toString().substring(0, 2)
          )
        },
      },
    },

    y: {
      border: {
        dash: [3, 5],
      },
      grid: {},
      ticks: {
        maxTicksLimit: 5,
      },
    },
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps(["dataurl"])
const store = datavizStore()
const formatedData = computed(() => store.formatedData)
const chartName = computed(() => store.chartName)
const chartUnit = computed(() => store.chartUnit)

watchEffect(() => {
  store.getDataFromUrl(props.dataurl)
})
</script>

<template>
  <div
    style="
      border: 1px solid #dddddd;
      margin-right: 20px;
      margin-bottom: 20px;
      padding: 20px;
      height: 300px;
    "
  >
    <h6 style="text-align: left">{{ chartName[props.dataurl] }}</h6>
    <div style="height: 70%" v-if="formatedData[props.dataurl]">
      <Line
        :data="formatedData[props.dataurl]"
        :options="options"
      /><br /><br />
    </div>
    <div class="flex fr-mt-3v fr-mb-1v">
      <span
        class="legende_dash_line1"
        v-bind:style="{ 'background-color': '#000091' }"
      ></span>
      <p class="fr-text--sm fr-text--bold fr-ml-1v fr-mb-0">
        {{ chartUnit[props.dataurl] }}
      </p>
    </div>
  </div>
</template>

<style>
.legende_dash_line1 {
  min-width: 0.4rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  display: inline-block;
}
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
