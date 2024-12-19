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
const intervalType = ref('all')
const salesData = reactive({ labels: [], datasets: [] })
const customerChart = reactive({ labels: [], datasets: [] })
const rangeDate = ref([])
const btnloading = ref('false')

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
  return inputString.replace(/_/g, ' ')
}

const getTypes = [
  { title: 'All', value: 'all' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' },
]

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
    const params = {
      vendor_id: userId,
      filter: intervalType.value,
      fromDate: rangeDate.value[0],
      toDate: rangeDate.value[1],
    }

    console.log('getChartData params', params)

    const res = await api.makeRequest('common/dashboard/orders/graphs', 'post', params)

    salesData.labels = res.data.labels
    salesData.datasets = res.data.datasets
    console.log('*****************common/dashboard/orders/graphs res***********', res)
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
    console.log('*****************common/dashboard/customer/graphs************', res)
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
    console.log('**************common/dashboard/top/items************', res)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

const getOrderSummery = async () => {
  try {
    const params = {
      vendor_id: userId,
      filter: intervalType.value,
      fromDate: rangeDate.value[0],
      toDate: rangeDate.value[1],
    }

    console.log('params', params)

    const res = await api.makeRequest('common/dashboard/orders/summary', 'post', params)

    console.log('**************common/dashboard/orders/summary************', res)

    // Update the ref object with the response data

    if (res?.data) {
      // Clear arrays to avoid duplicating data
      orderSummary.length = 0
      orderSummaryLabels.length = 0

      Object.keys(res?.data).forEach(key => {
        console.log(key, 'keyin')
        console.log(res?.data?.[key], 'res?.data?.[key]')

        const label = `${replaceUnderscoreWithSpace(key)} ${res?.data?.[key]}` || 0

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
      }
      catch (error) {
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
  }
  catch (error) {
    console.error('Error fetching orders:', error)
  }
}

const lastDateRanges = new Map()

const handleDateChange = async (newDate, isCalendarOpen, key) => {
  const dateRegex = /(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/

  const isNewDateNull = !newDate || !newDate.trim()
  const wasPreviousDateNull = !lastDateRanges.has(key) || !lastDateRanges.get(key)

  if (isNewDateNull && wasPreviousDateNull) {
    console.log('No change detected and both dates are null, skipping API call.')

    return
  }

  if (newDate && !newDate.includes('to')) {
    !isCalendarOpen && snackbarStore.showSnackbar('Please select a start and end date', 'primary')

    return
  }

  if (newDate && newDate.includes('to')) {
    const match = newDate.match(dateRegex)

    if (
      lastDateRanges.has(key)
      && lastDateRanges.get(key)
      && lastDateRanges.get(key).start === match[1]
      && lastDateRanges.get(key).end === match[2]
    ) {
      console.log('No change detected in date range, skipping API call.')

      return
    }

    intervalType.value = 'custom'
    rangeDate.value = [match[1], match[2]]

    lastDateRanges.set(key, { start: match[1], end: match[2] })
  }
  else if (isNewDateNull) {
    intervalType.value = 'monthly'
    rangeDate.value = [new Date(), new Date()]
    lastDateRanges.set(key, null)
  }

  try {
    loaderStore.showLoader()
    await fetchData() // Call all APIs when the date changes
  }
  catch (error) {
    console.error('Error during API calls:', error)
  }
  finally {
    loaderStore.hideLoader()
  }
}

const handleIntervalTypeChange = async value => {
  intervalType.value = value

  // Clear date range when selecting "All", "Weekly", or "Monthly"
  if (['all', 'weakly', 'monthly'].includes(value)) {
    rangeDate.value = []
    lastDateRanges.clear() // Reset stored date ranges
  }

  try {
    loaderStore.showLoader()
    await fetchData() // Call all APIs when the interval type changes
  }
  catch (error) {
    console.error('Error fetching data for interval type:', error)
  }
  finally {
    loaderStore.hideLoader()
  }
}

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

const exportData = async () => {
  try {
    console.log('Exporting data...')

    function formatDate(date: string) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    let formattedFromDate = ''
    let formattedToDate = ''

    if (rangeDate.value && rangeDate.value.length > 0) {
      formattedFromDate = formatDate(rangeDate.value[0])
      formattedToDate = formatDate(rangeDate.value[1])
    }

    const filter = intervalType.value === 'custom' ? 'custom' : intervalType.value

    console.log('filter:', filter)
    console.log('formattedFromDate:', formattedFromDate)
    console.log('formattedToDate:', formattedToDate)

    const exportUrl = `https://haiermall.jochaho.global/dashboard/export?vendor_id=${userId}&filter=${filter}&fromDate=${formattedFromDate}&toDate=${formattedToDate}`

    console.log('exportUrl:', exportUrl)
    window.location.href = exportUrl

    // Trigger download or make a GET request
    // await api.makeRequest(exportUrl, 'get')
    snackbarStore.showSnackbar('Export successful!', 'success')
  }
  catch (error) {
    console.error('Error exporting data:', error)
    snackbarStore.showSnackbar('Failed to export data.', 'error')
  }
  finally {
    // btnloading.value = false
  }
}
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <VCard>
        <VCardItem title="Dashboard">
          <template #append>
            <div class="d-flex align-items-center gap-5">
              <div>
                <VBtn
                  color="secondary"
                  @click="exportData"
                >
                  Export
                  <VIcon
                    end
                    icon="tabler-arrow-big-down-lines"
                  />
                </VBtn>
              </div>
              <div
                class="date-picker-wrapper"
                style="width: 315px;"
              >
                <AppDateTimePicker
                  v-model="rangeDate"
                  prepend-inner-icon="tabler-calendar"
                  placeholder="Select Date"
                  :config="$vuetify.display.smAndDown
                    ? { position: 'auto center' }
                    : { position: 'auto right' }
                  "
                  @update:model-value="(val, isCalendarOpen) => handleDateChange(val, isCalendarOpen.value, 'customer-graphs')"
                  @click:clear="handleNext"
                />
              </div>
              <div
                class=""
                style="width: 200px;"
              >
                <AppSelect
                  v-model="intervalType"
                  placeholder="Select Type"
                  :items="getTypes"
                  clearable
                  clear-icon="tabler-x"
                  @update:model-value="handleIntervalTypeChange"
                />
              </div>
            </div>
          </template>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <LogisticsCardStatistics :stats="ordersData" />
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VCard
        title="Delivered Orders"
        subtitle=""
      >
        <VCardText>
          <ChartJsLineChart
            :colors="chartJsCustomColors"
            :sales="salesData"
          />
        </VCardText>
      </VCard>
    </VCol>
    <!-- 👉 Latest Statistics -->
    <VCol
      cols="12"
      md="6"
    >
      <VCard>
        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
          <VCardTitle>Latest Statistics</VCardTitle>
        </VCardItem>

        <VCardText>
          <ChartJsBarChart
            :colors="chartJsCustomColors"
            :customers="customerChart"
          />
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Top Sold Items -->
    <VCol
      cols="12"
      md="6"
    >
      <AcademyTopicYouAreInterested
        :top-items-sold="topItemsSold"
        @date-change="handleDateChange"
      />
    </VCol>
    <!-- 👉 Top Sold Items End -->

    <!-- 👉 Order Summary  -->
    <VCol
      cols="12"
      md="6"
    >
      <VCard
        title="Order Summary"
        subtitle=""
      >
        <VCardText>
          <ApexChartExpenseRatio
            :series="orderSummary"
            :labels="orderSummaryLabels"
          />
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
