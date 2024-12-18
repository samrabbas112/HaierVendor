<script lang="ts" setup>
import LogisticsCardStatistics from '@/views/dashboards/logistics/LogisticsCardStatistics.vue'
import AcademyTopicYouAreInterested from '@/views/dashboards/academy/AcademyTopicYouAreInterested.vue'
import ApexChartExpenseRatio from '@/views/charts/apex-chart/ApexChartExpenseRatio.vue'
import ChartJsLineChart from '@/views/charts/chartjs/ChartJsLineChart.vue'
import LogisticsOverviewTable from '@/views/dashboards/logistics/LogisticsOverviewTable.vue'
import ChartJsBarChart from '@/views/charts/chartjs/ChartJsBarChart.vue'
import { useLoaderStore } from '@/stores/loader'
import { useSnackbarStore } from '@/stores/snackbar'

definePageMeta({
  middleware: ['auth'],
})

const loaderStore = useLoaderStore()
const snackbarStore = useSnackbarStore()
const authStore = useAuthStore()
const api = useApi()

await authStore.initialize()

const userId = authStore?.user?.user_id

const ordersData = reactive({ totalOrders: 0, totalSales: 0, totalCustomer: 0 })
const topItemsSold = reactive([])
const orderSummary = reactive([])
const orderSummaryLabels = reactive([])
const tableData = reactive([])
const intervalType = ref('monthly')
const salesData = reactive({ labels: [], datasets: [] })
const customerChart = reactive({ labels: [], datasets: [] })
const rangeDate = ref([])
const minDateOncustomerChart = ref(new Date())

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

function replaceUnderscoreWithSpace(inputString) {
  return inputString.replace(/_/g, ' ');
}

// const series = [85, 16, 50, 50, 20]

// const labels = [
//   'Closed',
//   'Delivery Refused',
//   'OutForDelivery',
//   'Picked',
// ]

const getOrderData = async () => {
  const params = {
    vendor_id: userId,
  }

  const response = await api.makeRequest('common/dashboard/stats', 'post', params)

  console.log('response', response)

  ordersData.totalOrders = response.data.totalOrders
  ordersData.totalSales = response.data.totalSales
  ordersData.totalCustomer = response.data.totalCustomer
  console.log('res:', response.data)
}

const getChartData = async () => {
  try {
    const params = { vendor_id: userId, filter: intervalType.value }

    console.log('params', params)

    const res = await api.makeRequest('common/dashboard/orders/graphs', 'post', params)

    salesData.labels = res.data.labels
    salesData.datasets = res.data.datasets
    console.log('res', res)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

const getCustomerData = async () => {
  try {
    const params = {
      vendor_id: userId,
      filter: intervalType.value,
      fromDate: rangeDate.value[0],
      toDate: rangeDate.value[1],
    }

    console.log('params', params)

    const res = await api.makeRequest('common/dashboard/customer/graphs', 'post', params)

    customerChart.labels = res.data.labels
    customerChart.datasets = res.data.datasets

    minDateOncustomerChart.value = new Date(Math.min(...customerChart.labels.map(label => new Date(label))))

    console.log('res', res)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

const getTopSelling = async () => {
  try {
    const params = {
      vendor_id: userId,
      filter: intervalType.value,
      fromDate: rangeDate.value[0],
      toDate: rangeDate.value[1],
    }

    console.log('params', params)

    const res = await api.makeRequest('common/dashboard/top/items', 'post', params)

    topItemsSold.length = 0 // Clear the array
    topItemsSold.push(...res.data)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

const getOrderSummery = async () => {
  try {
    const params = {
      vendor_id: userId,
    }

    console.log('params', params)

    const res = await api.makeRequest('common/dashboard/orders/summary', 'post', params)

    // Update the ref object with the response data

    if (res?.data) {
      // Clear arrays to avoid duplicating data
      orderSummary.length = 0
      orderSummaryLabels.length = 0

      Object.keys(res?.data).forEach(key => {
        console.log(key,'keyin');
        console.log(res?.data?.[key],'res?.data?.[key]');
        let label = replaceUnderscoreWithSpace(key) + ' ' + res?.data?.[key] || 0
        orderSummaryLabels.push(label)
        orderSummary.push(res?.data?.[key] || 0)
        // orderSummary.push(0)
      })
    }

    console.log('res', res)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

const getTableData = async () => {
  const params = {
    vendor_id: userId,
  }

  try {
    const res = await api.makeRequest('common/dashboard/orders', 'post', params)

    console.log('public/dashboard/vendor/orders =>', res)

    // Ensure tableData is cleared before pushing new items
    tableData.length = 0
    res?.data?.forEach(order => {
      let paymentChannel
      try {
        paymentChannel = JSON.parse(order.payload)?.channel || 'Unknown'
      } catch (error) {
        console.error('Error parsing order payload:', error)
        paymentChannel = 'Unknown'
      }

      tableData.push({
        created_at: order.created_at,
        order_no: order.order_no,
        price: order.paymentAmount,
        payment_method: paymentChannel,
        status: order.pick_status?.name || 'Unknown',
      })
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

const lastDateRanges = new Map();

const handleDateChange = async (newDate, isCalendarOpen, key) => {
  const dateRegex = /(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/

  // Check if the current date is null
  const isNewDateNull = !newDate || !newDate.trim();
  const wasPreviousDateNull = !lastDateRanges.has(key) || !lastDateRanges.get(key);

  // If newDate and previous date are both null, skip the API call
  if (isNewDateNull && wasPreviousDateNull) {
    console.log("No change detected and both dates are null, skipping API call.");
    return;
  }
  if (newDate && !newDate.includes("to")) {
    !isCalendarOpen && snackbarStore.showSnackbar("Please select a start and end date", 'primary')
    return;
  }

  if (newDate && newDate.includes("to")) {
    const match = newDate.match(dateRegex);

    // Check if the current range matches the last range for this key
    if (
      lastDateRanges.has(key) &&
      lastDateRanges.get(key) &&
      lastDateRanges.get(key).start === match[1] &&
      lastDateRanges.get(key).end === match[2]
    ) {
      console.log("No change detected in date range, skipping API call.");
      return;
    }

    intervalType.value = 'custom';
    rangeDate.value = [match[1], match[2]];

    // Store the new date range for the current key
    lastDateRanges.set(key, { start: match[1], end: match[2] });
  } else if (isNewDateNull) {
    // If newDate is null, reset to 'monthly' and clear the range
    intervalType.value = 'monthly';
    rangeDate.value = [new Date(), new Date()];
    lastDateRanges.set(key, null);  // Set the last date range to null
  }

  try {
    loaderStore.showLoader();
    if (key === 'top-item-sold') {
      await getTopSelling();
    } else {
      await getCustomerData();
    }
  } finally {
    loaderStore.hideLoader();
  }
};

const fetchData = async () => {
  try {
    loaderStore.showLoader()
    await Promise.all([
      getOrderData(),
      getTableData(),
      getChartData(),
      getCustomerData(),
      getTopSelling(),
      getOrderSummery(),
    ])
  }
  finally {
    loaderStore.hideLoader()
  }
}

onMounted(() => {
  fetchData()
})

const exportData = () => {
  const response = api.makeRequest('common/dashboard/export', 'get', { vendor_id: userId })
  console.log({response});
}
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <VCard>
        <VCardItem title="Dashboard">
          <template #append>
            <button class="btn btn-primary" @click="exportData">Export </button>
            <div class="date-picker-wrapper" style="width: 240px;">
              <AppDateTimePicker @update:modelValue="(val, isCalendarOpen) => handleDateChange(val,isCalendarOpen.value, 'top-item-sold')"
                @click:clear="handleNext"
                model-value="" prepend-inner-icon="tabler-calendar"
                placeholder="Select Date" :config="$vuetify.display.smAndDown
                  ? { position: 'auto center' }
                  : { position: 'auto right' }
                  " />
            </div>
          </template>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <LogisticsCardStatistics  :stats="ordersData" />
    </VCol>

    <VCol cols="12" md="6">
      <VCard title="Delivered Orders" subtitle="">
        <VCardText>
          <ChartJsLineChart :colors="chartJsCustomColors" :sales="salesData" />
        </VCardText>
      </VCard>
    </VCol>
    <!-- 👉 Latest Statistics -->
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
          <VCardTitle>Latest Statistics</VCardTitle>
          <template #append>
            <div class="date-picker-wrapper" style="width: 240px;">
              <!-- <AppDateTimePicker @update:modelValue="handleDateChange" -->
              <AppDateTimePicker @update:modelValue="(val, isCalendarOpen) => handleDateChange(val,isCalendarOpen.value, 'customer-graphs')"
                @click:clear="handleNext"
                model-value="" prepend-inner-icon="tabler-calendar"
                placeholder="Select Date" :config="$vuetify.display.smAndDown
                  ? { position: 'auto center' }
                  : { position: 'auto right' }
                  " />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <ChartJsBarChart :colors="chartJsCustomColors" :customers="customerChart" />
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Top Sold Items -->
    <VCol cols="12" md="6">
      <AcademyTopicYouAreInterested :top-items-sold="topItemsSold" @dateChange="handleDateChange" />
    </VCol>
    <!-- 👉 Top Sold Items End -->

    <!-- 👉 Order Summary  -->
    <VCol cols="12" md="6">
      <VCard title="Order Summary" subtitle="">
        <VCardText>
          <ApexChartExpenseRatio :series="orderSummary" :labels="orderSummaryLabels" />
        </VCardText>
      </VCard>
    </VCol>
    <!-- 👉 Order Summary End -->

    <!-- 👉 My orders Table -->
    <VCol cols="12">
      <LogisticsOverviewTable :data="tableData" />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
