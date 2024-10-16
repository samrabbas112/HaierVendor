<script lang="ts" setup>

import LogisticsCardStatistics from '@/views/dashboards/logistics/LogisticsCardStatistics.vue'
import AcademyTopicYouAreInterested from '@/views/dashboards/academy/AcademyTopicYouAreInterested.vue'
import ApexChartExpenseRatio from '@/views/charts/apex-chart/ApexChartExpenseRatio.vue'
import ChartJsLineChart from "@/views/charts/chartjs/ChartJsLineChart.vue";
const chartJsCustomColors: ChartJsCustomColors = {
  white: '#fff',
  yellow: '#ffe802',
  primary: '#836af9',
  areaChartBlue: '#2c9aff',
  barChartYellow: '#ffcf5c',
  polarChartGrey: '#4f5d70',
  polarChartInfo: '#299aff',
  lineChartYellow: '#d4e157',
  polarChartGreen: '#28dac6',
  lineChartPrimary: '#9e69fd',
  lineChartWarning: '#ff9800',
  horizontalBarInfo: '#26c6da',
  polarChartWarning: '#ff8131',
  scatterChartGreen: '#28c76f',
  warningShade: '#ffbd1f',
  areaChartBlueLight: '#84d0ff',
  areaChartGreyLight: '#edf1f4',
  scatterChartWarning: '#ff9f43',
}
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <LogisticsCardStatistics />
    </VCol>


    <VCol cols="6">
      <VCard
        title="Statistics"
        subtitle="Commercial networks and enterprises"
      >
        <VCardText>
          <ChartJsLineChart :colors="chartJsCustomColors" />
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="6">
      <VCard
        title="Statistics"
        subtitle="Commercial networks and enterprises"
      >
        <VCardText>
          <ChartJsLineChart :colors="chartJsCustomColors" />
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <!-- 👉 Topic You are Interested in -->
      <AcademyTopicYouAreInterested />
    </VCol>



    <!-- 👉 Expense Ratio Chart -->
    <VCol
      cols="12"
      md="6"
    >
      <VCard
        title="Expense Ratio"
        subtitle="Spending on various categories"
      >
        <VCardText>
          <ApexChartExpenseRatio />
        </VCardText>
      </VCard>
    </VCol>




  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
