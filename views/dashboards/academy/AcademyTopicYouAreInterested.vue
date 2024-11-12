<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

const props = defineProps<{
  topItemsSold: Array<{ vendor_id: number; product_name: string; total_sales: string }>
}>()

// Define emit for update:modelValue event
const emit = defineEmits(['dateChange'])

// Emit event function to trigger 'update:modelValue' with the selected date
const handleDateChange = (newDate: string) => {
  let key = 'top-item-sold'
  emit('dateChange', newDate, key);
};

// Function to round to the nearest even number
const roundToNearestFive = num => {
  return Math.ceil(num / 5) * 5
}

const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const chartData = computed(() => {
  // Clear the array first to avoid duplicating values
  const topicsChartLabels = [...new Set(props.topItemsSold.map(item => item.product_name))];

  const totalSales = props.topItemsSold.reduce((sum, item) => sum + Number.parseInt(item.total_sales, 10), 0);

  const topicsChartSeries = [
    {
      data: props.topItemsSold.map(item => {
        // Calculate percentage only if totalSales is greater than zero to avoid division by zero
        return totalSales > 0
          ? Math.round((Number.parseInt(item.total_sales, 10) / totalSales) * 100)
          : 0; // Return 0 if totalSales is 0
      })
    }
  ];

  const xAxisCategories = Array.from({ length: props.topItemsSold.length }, (_, i) => (props.topItemsSold.length - i).toString());

  const yMax = roundToNearestFive(Math.max(...topicsChartSeries[0].data) || 50);

  return {
    labels: topicsChartLabels,
    series: topicsChartSeries,
    xCategories: xAxisCategories,
    yMax,
    totalSales,
  };
});

// Topics Charts config
const topicsChartConfig = computed(() => ({
  chart: {
    height: 270,
    type: "bar",
    toolbar: {
      show: false,
    },
  },

  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "70%",
      distributed: true,
      borderRadius: 7,
      borderRadiusApplication: "end",
    },
  },

  colors: [
    "rgba(var(--v-theme-primary),1)",
    "rgba(var(--v-theme-info),1)",
    "rgba(var(--v-theme-success),1)",
    "rgba(var(--v-theme-secondary),1)",
    "rgba(var(--v-theme-error),1)",
    "rgba(var(--v-theme-warning),1)",
  ],

  grid: {
    borderColor,
    strokeDashArray: 10,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
    padding: {
      top: -35,
      bottom: -12,
    },
  },

  dataLabels: {
    enabled: true,
    style: {
      colors: ["#fff"],
      fontWeight: 200,
      fontSize: "13px",
    },
    offsetX: 0,
    dropShadow: {
      enabled: false,
    },
    formatter(val: string, opt: any) {
      // return chartData?.value?.labels[opt.dataPointIndex];
      const percentage = chartData.value.series[0].data[opt.dataPointIndex];
      const productName = chartData.value.labels[opt.dataPointIndex];

      // If percentage is less than 5%, show truncated name with ellipsis
      if (percentage <= (chartData.value.yMax / 5)) {
        return `${productName.substring(0, 4)}...`;
      } else {
        return productName;
      }
    },
  },

  // labels: [
  //   "MicroWave Oven",
  //   "Air Conditioner",
  //   "Washing Machine",
  //   "Refrigerator",
  //   "Deep Freezer",
  //   "LED",
  // ],
  labels: chartData?.value?.labels,

  xaxis: {
    // categories: ["6", "5", "4", "3", "2", "1"],
    categories: chartData?.value?.xCategories,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: "rgba(var(--v-theme-on-background), var(--v-disabled-opacity))",
        fontSize: "13px",
      },
      formatter(val: string) {
        return `${val}%`;
      },
    },
  },

  yaxis: {
    max: chartData?.value?.yMax,
    labels: {
      style: {
        colors: "rgba(var(--v-theme-on-background), var(--v-disabled-opacity))",
        fontSize: "13px",
      },
    },
  },

  tooltip: {
    enabled: true,
    style: {
      fontSize: "12px",
    },
    onDatasetHover: {
      highlightDataSeries: false,
    },
    custom: ({ seriesIndex, dataPointIndex }) => {
      // Access product name and total sales directly
      const productName = chartData.value.labels[dataPointIndex]
      const sale = props.topItemsSold[dataPointIndex].total_sales

      // Customize tooltip content without "Series-1"
      return `
      <div style="background-color: #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px;">
        <strong>${productName}</strong><br/>
        Quantity Sold: ${sale}<br/>
        Percentage: ${((Number.parseInt(sale, 10) / chartData.value.totalSales) * 100).toFixed(2)}%
      </div>
    `;
    },
  },
  legend: {
    show: false,
  },
}));

// const topicsChartSeries = [
//   {
//     data: [95, 40, 60, 80, 100],
//   },
// ];

const topicsData = [
  { title: "UI Design", value: 100, color: "primary" },
  { title: "UX Design", value: 20, color: "info" },
  { title: "Music", value: 14, color: "success" },
  { title: "Animation", value: 12, color: "secondary" },
  { title: "Vue", value: 10, color: "error" },
  { title: "SEO", value: 9, color: "warning" },
];
</script>

<template>
  <VCard>
    <VCardItem title="Top Items Sold" class="d-flex flex-wrap justify-space-between gap-4"> 
          <template #append>
            <div class="date-picker-wrapper">
              <AppDateTimePicker
                @update:modelValue="handleDateChange"
                model-value="" prepend-inner-icon="tabler-calendar"
                placeholder="Select Date" :config="$vuetify.display.smAndDown
                  ? { position: 'auto center' }
                  : { position: 'auto right' }
                  " />
            </div>
          </template>

    </VCardItem>

    <VCardText>
      <VRow>
        <VCol cols="12" md="12" xl="12" lg="12">
          <div>
            <VueApexCharts
              type="bar"
              height="260"
              :options="topicsChartConfig"
              :series="chartData.series"
            />
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
