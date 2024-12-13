<script setup lang="ts">
const apiRequestObj = useApi()
const snackbarStore = useSnackbarStore()
const loaderStore = useLoaderStore()

const searchQuery = ref('')
const selectedPaymentMethod = ref()
const selectedOrderStatus = ref()

const ordersData = ref({
  per_page: 10,
  current_page: 1,
  total: 0,
  orders: [],
})

const authUser = useCookie('auth')

// Data table Headers
const headers = [
  { title: 'Order#', key: 'order', sortable: false },
  { title: 'Total Price', key: 'payment', sortable: false },
  { title: 'Customers', key: 'customer', sortable: false },
  { title: 'Payment Method', key: 'method', sortable: false },
  { title: 'Placed At', key: 'date', sortable: false },
  { title: 'City', key: 'city', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

const paymentMethods = [
  { title: 'COD', value: 'COD' },
]

const orderStatus = [
  { title: 'Picked', value: 'picked' },
  { title: 'Out for delivery', value: 'out_for_delivery' },
  { title: 'Delivery Refused', value: 'delivery_refused' },
  { title: 'Closed', value: 'closed' },
]

const transformData = apiResponse => {
  return apiResponse.map(item => {
    const customer = item.customer

    return {
      id: item.id,
      uid: item.uid,
      order: item.order_no,
      customer: customer.name || 'N/A',
      mobile: customer.mobile || '03XXXXXXXXXX',
      payment: Number.parseFloat(item.paymentAmount) || 0,
      status: item.pick_status || 'Unknown',
      method: item.payment_method || 'COD', // Payment method
      // date: new Date(item.created_at).toLocaleString("en-US", dateTimeOptions),
      date: item.created_at,
      time: item.pick_before,
      city: item.city,
    }
  })
}

let previousSearchQuery = ''

const makeSearch = async page => {
  // return console.log("search api hit", typeof page, searchQuery.value, page);
  console.log('search function hit', searchQuery.value)

  // Check if searchQuery has changed, reset page to 1 if it has
  if (searchQuery.value !== previousSearchQuery)
    page = 1 // Reset to page 1 if the search query has changed

  const formData = {
    order_no: searchQuery.value,
    order_status: selectedOrderStatus.value,
    payment_status: selectedPaymentMethod.value,
    vendor_id: authUser.value.user.user_id,
    order_type: 'my_orders',
  }

  try {
    loaderStore.showLoader()

    const response = await apiRequestObj.makeRequest(
      `common/order/list?page=${typeof page == 'number' ? page : 1}`,
      'post',
      formData,
    )

    if (response && response.success) {
      // Transform and set the data
      ordersData.value = {
        per_page: response?.data?.per_page,
        current_page: response?.data?.currentPage,
        total: response?.data?.total, // Set total count of orders
        orders: transformData(response?.data?.orders),
      }
    }
    else {
      snackbarStore.showSnackbar(
        'An error occurred. Please try again.',
        'error',
      )
    }
  }
  catch (error) {
    snackbarStore.showSnackbar('An error occurred. Please try again.', 'error')
  }
  finally {
    loaderStore.hideLoader()
  }

  // Update the previous search query to the current one
  previousSearchQuery = searchQuery.value
}

onMounted(() => {
  makeSearch(1)
})
</script>

<template>
  <CustomTable
    :headers="headers"
    :data="ordersData"
    from="haier"
    @update:page="makeSearch"
  >
    <VCardText>
      <VRow
        cols="12"
        sm="8"
      >
        <!-- 👉 Select Status -->
        <VCol
          cols="12"
          sm="3"
        >
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Order#"
          />
        </VCol>
        <VCol
          cols="12"
          sm="3"
        >
          <AppSelect
            v-model="selectedOrderStatus"
            placeholder="Select Order Status"
            :items="orderStatus"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>
        <VCol
          cols="12"
          sm="3"
        >
          <AppSelect
            v-model="selectedPaymentMethod"
            placeholder="Select Payment Method"
            :items="paymentMethods"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>

        <VCol
          cols="12"
          sm="3"
        >
          <div class="d-flex">
            <VBtn
              class="me-2"
              variant="outlined"
              color="secondary"
              @click="() => {
                searchQuery = '';
                selectedOrderStatus = null;
                selectedPaymentMethod = null
                makeSearch(1)
              }"
            >
              Reset
            </VBtn>
            <VBtn
              variant="flat"
              @click="makeSearch"
            >
              Search
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </CustomTable>
</template>

<style lang="scss" scoped>
.customer-title:hover {
  color: rgba(var(--v-theme-primary)) !important;
}

.product-widget {
  border-block-end: 1px solid
    rgba(var(--v-theme-on-surface), var(--v-border-opacity));
  padding-block-end: 1rem;
}
</style>
