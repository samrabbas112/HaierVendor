<script lang="ts" setup>
import LogisticsCardStatistics from '@/views/dashboards/logistics/LogisticsCardStatistics.vue'
import AcademyTopicYouAreInterested from '@/views/dashboards/academy/AcademyTopicYouAreInterested.vue'
import ApexChartExpenseRatio from '@/views/charts/apex-chart/ApexChartExpenseRatio.vue'
import ChartJsLineChart from '@/views/charts/chartjs/ChartJsLineChart.vue'
import LogisticsOverviewTable from '@/views/dashboards/logistics/LogisticsOverviewTable.vue'
import ChartJsBarChart from '@/views/charts/chartjs/ChartJsBarChart.vue'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()
const api = useApi()

await authStore.initialize()

const userId = authStore?.user
console.log("userid", userId)
const ordersData = reactive({ totalOrders: 0, totalSales: 0, totalCustomer: 0 })
const tableData = reactive([])
const selectedDate = ref('monthly')

const rangeDate = ref(['2024-05-20'], ['2024-05-20'])

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

const series = [85, 16, 50, 50, 20]

const labels = [
  'Closed',
  'Picked',
  'Rejected',
  'OutForDelivery',
  'Delivery Refused',
]

const getOrderData = async () => {
  const params = {
    vendor_id: 5,
  }

  const response = await api.makeRequest('admin/dashboard/stats', 'post', params)

  console.log('response', response)

  ordersData.totalOrders = response.data.totalOrders
  ordersData.totalSales = response.data.totalSales
  ordersData.totalCustomer = response.data.totalCustomer
  console.log('res:', response.data)
}

const getChartData = async () => {
  try {
    const params = { vendor_id: userId, filter: selectedDate.value }

    console.log('params', params)

    const res = await api.makeRequest('admin/dashboard/orders/graphs', 'post', params)

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
      filter: selectedDate.value,
    }

    console.log('params', params)

    const res = await api.makeRequest('admin/dashboard/customer/graphs', 'post', params)

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
      filter: selectedDate.value,
      fromDate: rangeDate.value[0],
      toDate: rangeDate.value[1],
    }

    console.log('params', params)

    const res = await api.makeRequest('admin/dashboard/top/items', 'post', params)

    console.log('res', res)
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

    const res = await api.makeRequest('admin/dashboard/orders/summary', 'post', params)

    console.log('res', res)
  }
  catch (err) {
    console.error('Error: ', err)
  }
}

function getTableData() {
  const params = {
    vendor_id: userId,
  }

  api.makeRequest('admin/dashboard/orders', 'post', params)
    .then(res => {
      console.log('public/dashboard/vendor/orders=>', res.data)
      tableData = res.data

      // tableData.length = 0
      // res.data.data.forEach(order => {
      //   tableData.push({
      //     // formattedDate: formatDate(order.created_at),
      //     orderNo: order.order_no,
      //     price: order.paymentAmount,
      //     payment: JSON.parse(order.payload).channel,
      //     status: order.pick_status.name,
      //   })
    })
    .catch(error => {
      console.log('error', error)
    })
}
onMounted(() => {
  getOrderData()
  // getTableData()
  // getChartData()
  // getCustomerData()
  // getTopSelling()
  // getOrderSummery()
})
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <LogisticsCardStatistics :stats="ordersData" />
    </VCol>

    <VCol cols="6">
      <VCard
        title="Delivered Orders"
        subtitle=""
      >
        <VCardText>
          <ChartJsLineChart :colors="chartJsCustomColors" />
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
          <template #append>
            <div class="date-picker-wrapper">
              <AppDateTimePicker
                model-value="2022-06-09"
                prepend-inner-icon="tabler-calendar"
                placeholder="Select Date"
                :config="
                  $vuetify.display.smAndDown
                    ? { position: 'auto center' }
                    : { position: 'auto right' }
                "
              />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <ChartJsBarChart :colors="chartJsCustomColors" />
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Top Sold Items -->
    <VCol
      cols="12"
      md="6"
    >
      <AcademyTopicYouAreInterested />
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
            :series="series"
            :labels="labels"
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
