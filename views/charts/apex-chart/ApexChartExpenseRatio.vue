<script lang="ts" setup>
import { useTheme } from "vuetify";
import { getDonutChartConfig } from "@core/libs/apex-chart/apexCharConfig";

const props = defineProps({
  series: {
    type: Array,
  },
  labels: {
    type: Array,
  },
});

const vuetifyTheme = useTheme();

// const expenseRationChartConfig = computed(() =>
//   getDonutChartConfig(vuetifyTheme.current.value),
// );

// expenseRationChartConfig.value.labels = props.labels;

// Check if all values in series are 0
const isSeriesZero = computed(() => props.series.every((value) => value === 0));

// Configure the chart
const expenseRationChartConfig = computed(() => {
  const config = getDonutChartConfig(vuetifyTheme.current.value);
  console.log({
    config,
    series: props.series,
    labels: props.labels,
  });

  config.labels = props.labels;

  // Apply gray color if all series values are zero
  config.colors = isSeriesZero.value ? ["#D3D3D3"] :  [
  "#1E90FF", // Blue - Haier Operations
  "#32CD32", // Green - Picked
  "#FFA500", // Orange - Out For Delivery
  "#FF6347", // Red - Delivery Refused
  "#800080", // Purple - Closed
  "#FF4500", // Dark Orange - Delivery Timeout
  "#20B2AA", // Teal - Ready To Ship
  "#FFD700", // Gold - Rejected
]; // Gray color for zero values

  // Customize the center label to show 0% if series is zero
  config.plotOptions = {
    pie: {
      donut: {
        labels: {
          show: true,
          name:{
            show:false
          },
          total: {
            show: true,
            label: "Total",
            formatter: () => {
              // Show "0%" if all values are zero
              return isSeriesZero.value ? "0%" : "100%";
            },
          },
        },
      },
    },
  };

  return config;
});
</script>

<template>
  <VueApexCharts
    type="donut"
    height="310"
    :options="expenseRationChartConfig"
    :series="series"
  />
</template>
