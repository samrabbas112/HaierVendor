<script setup lang="ts">
import { useTheme } from "vuetify";
import type { ChartJsCustomColors } from "@/views/charts/chartjs/types";
import { getLatestBarChartConfig } from "@core/libs/chartjs/chartjsConfig";
import BarChart from "@core/libs/chartjs/components/BarChart";

interface Props {
  colors: ChartJsCustomColors;
}

const props = defineProps<Props>();

const vuetifyTheme = useTheme();

const chartOptions = computed(() =>
  getLatestBarChartConfig(vuetifyTheme.current.value),
);

const data = {
  labels: Array.from({ length: 30 }, (_, i) => i + 1),
  datasets: [
    {
      maxBarThickness: 8,
      backgroundColor: props.colors.polarChartInfo,
      borderColor: "transparent",
      borderRadius: { topRight: 15, topLeft: 15 },
      data: [
        80, 150, 180, 270, 210, 160, 160, 202, 265, 210, 270, 255, 290, 360,
        375, 80, 125, 105, 130, 215, 195, 140, 160, 230, 300, 220, 170, 210,
        200, 280,
      ],
    },
  ],
};
</script>

<template>
  <BarChart :height="400" :chart-data="data" :chart-options="chartOptions" />
</template>
