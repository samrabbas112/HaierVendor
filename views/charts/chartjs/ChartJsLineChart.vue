<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed, defineProps } from 'vue'
import { getLineChartConfig } from '@core/libs/chartjs/chartjsConfig'
import LineChart from '@core/libs/chartjs/components/LineChart'

import type { ChartJsCustomColors } from '@/views/charts/chartjs/types'

interface Props {
  colors: ChartJsCustomColors
  sales: {
    type: object
    required: true
  }
}

const props = defineProps<Props>()

const vuetifyTheme = useTheme()

const data = computed(() => ({
  labels: props.sales.labels,
  datasets: [
    {
      fill: false,
      tension: 0.5,
      pointRadius: 1,
      label: 'Total Sales',
      pointHoverRadius: 5,
      pointStyle: 'circle',
      borderColor: props.colors.primary,
      backgroundColor: props.colors.primary,
      pointHoverBorderWidth: 5,
      pointHoverBorderColor: props.colors.white,
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: props.colors.primary,
      data: props.sales.datasets?.totalSales,
    },
    {
      fill: false,
      tension: 0.5,
      label: 'Delivered Orders',
      pointRadius: 1,
      pointHoverRadius: 5,
      pointStyle: 'circle',
      borderColor: props.colors.warningShade,
      backgroundColor: props.colors.warningShade,
      pointHoverBorderWidth: 5,
      pointHoverBorderColor: props.colors.white,
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: props.colors.warningShade,
      data: props.sales.datasets?.deliveredOrder,
    },
  ],
}))

const chartConfig = computed(() =>
  getLineChartConfig(vuetifyTheme.current.value),
)
</script>

<template>
  <LineChart
    :chart-options="chartConfig"
    :height="400"
    :chart-data="data"
  />
</template>
