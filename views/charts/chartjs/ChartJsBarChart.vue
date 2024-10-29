<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed } from 'vue'
import type { ChartJsCustomColors } from '@/views/charts/chartjs/types'
import { getLatestBarChartConfig } from '@core/libs/chartjs/chartjsConfig'
import BarChart from '@core/libs/chartjs/components/BarChart'

interface Props {
  colors: ChartJsCustomColors
  customers: {
    type: object
    required: true
  }
}

const props = defineProps<Props>()

const vuetifyTheme = useTheme()

const chartOptions = computed(() =>
  getLatestBarChartConfig(vuetifyTheme.current.value),
)

const data = computed(() => ({
  labels: props.customers.labels,
  datasets: [
    {
      maxBarThickness: 8,
      backgroundColor: props.colors.polarChartInfo,
      borderColor: 'transparent',
      borderRadius: { topRight: 15, topLeft: 15 },
      data: props.customers.datasets?.customerTotal,
    },
  ],
}))
</script>

<template>
  <BarChart
    :height="400"
    :chart-data="data"
    :chart-options="chartOptions"
  />
</template>
