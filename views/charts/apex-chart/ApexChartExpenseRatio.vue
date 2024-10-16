<script lang="ts" setup>
import { useTheme } from "vuetify";
import { getDonutChartConfig } from "@core/libs/apex-chart/apexCharConfig";
const vuetifyTheme = useTheme();
const props = defineProps({
  series: {
    type: Array,
  },
  labels: {
    type: Array,
  },
});
const expenseRationChartConfig = computed(() =>
  getDonutChartConfig(vuetifyTheme.current.value),
);

expenseRationChartConfig.value.labels = props.labels;
</script>

<template>
  <VueApexCharts
    type="donut"
    height="310"
    :options="expenseRationChartConfig"
    :series="series"
  />
</template>
