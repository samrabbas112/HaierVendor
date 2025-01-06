<script setup lang="ts">
import { orderStatusCodes } from '../../../libs/order/order-status'

const apiRequestObj = useApi()
const snackbarStore = useSnackbarStore()
const loaderStore = useLoaderStore()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const vendorQuery = ref('')
const selectedVendor = ref()
const selectedPaymentMethod = ref()
const selectedOrderType = ref()
const selectedOrderStatus = ref()
const vendors = ref([])

const ordersData = ref({
  per_page: 10,
  current_page: 1,
  total: 0,
  orders: [],
})

// Data table Headers
const headers = [
  { title: 'Sr. No.', key: 'id', sortable: false },
  { title: 'Order Info', key: 'order', sortable: false },
  { title: 'Product Info', key: 'product', sortable: false },
  { title: 'Total Price', key: 'payment', sortable: false },
  { title: 'Customers', key: 'customer', sortable: false },
  { title: 'Payment Method', key: 'method', sortable: false },

  // { title: "Placed At", key: "date", sortable: false },
  { title: 'Assigned To', key: 'vendors', sortable: false },
  { title: 'Order Status', key: 'status', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

const paymentMethods = [
  { title: 'COD', value: 'COD' },
  { title: 'Card', value: 'Card' },
  { title: 'EasyPaisa', value: 'EasyPaisa' },
  { title: 'jazzCash', value: 'jazzCash' },
]

const orderTypes = [
  { title: 'Private', value: 'private' },
  { title: 'Public', value: 'public' },
]

const orderStatus = [
  { title: 'Picked', value: orderStatusCodes.isPicked },
  { title: 'Out for delivery', value: orderStatusCodes.isOutForDelivery },
  { title: 'Delivery Refused', value: orderStatusCodes.isDeliveryRefused },
  { title: 'Closed', value: orderStatusCodes.isClosed },
  { title: 'Ready to ship', value: orderStatusCodes.isReadyToShip },
  { title: 'haier operations', value: orderStatusCodes.isHaier },
  { title: 'Delivery timeout', value: orderStatusCodes.isDeliveryTimeout },
  { title: 'Rejected', value: orderStatusCodes.isRejected },
  { title: 'Cancelled', value: orderStatusCodes.isCancelled },
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
      status: item.pick_status.id || 1,
      method: item.payment_method || 'COD', // Payment method
      date: item.created_at,
      time: item.pick_before,
      vendor_name: item.vendor_name,
      vendor_email: item.vendor_email,
      products: item.orderProduct,
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
    order_type: selectedOrderType.value,
    vendor_id: selectedVendor.value || route.query.user,
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
      if (route.query.user && response?.data?.total > 0) {
        const filteredVendor = vendors.value.filter(vendor => vendor.value == route.query.user)

        selectedVendor.value = filteredVendor[0]
        router.replace({ path: route.path, query: {} })
      }
    }
    else if (response?.code === 401 || response?.message === 'Unauthenticated.') {
      snackbarStore.showSnackbar('Login session expired', 'error')
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

const fetchVendors = async () => {
  try {
    const response = await apiRequestObj.makeRequest(
      'haier/vendor/order',
      'get',
    )

    if (response && response.success) {
      vendors.value = response?.data
    }
    else if (response?.code === 401 || response?.message === 'Unauthenticated.') {
      snackbarStore.showSnackbar('Login session expired', 'error')
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
}

const fetchData = async () => {
  try {
    loaderStore.showLoader()
    await Promise.all([fetchVendors(), makeSearch(1)])
  }
  finally {
    loaderStore.hideLoader()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <CustomTable
    :headers="headers"
    :data="ordersData"
    from="vendor"
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
            v-model="selectedVendor"
            placeholder="Select Vendor"
            :items="vendors"
            clearable
            clear-icon="tabler-x"
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
          <AppSelect
            v-model="selectedOrderType"
            placeholder="Select order type"
            :items="orderTypes"
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
              @click="
                () => {
                  searchQuery = '';
                  vendorQuery = '';
                  selectedOrderStatus = null;
                  selectedPaymentMethod = null;
                  selectedOrderType = null;
                  makeSearch(1);
                }
              "
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
