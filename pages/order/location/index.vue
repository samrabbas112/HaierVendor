<script setup lang="ts">
definePageMeta({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const apiRequestObj = useApi()
const snackbarStore = useSnackbarStore()
const loaderStore = useLoaderStore()
const notificationStore = useNotificationStore()

const authUser = useCookie('auth')

const searchQuery = ref('')

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
  { title: 'Pick Before', key: 'time', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
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
      products: item.orderProduct,
    }
  })
}

let previousSearchQuery = ''

const makeSearch = async page => {
  // return console.log("search api hit", typeof page, searchQuery.value, page);
  console.log('search function hit', searchQuery.value, page)

  // Check if searchQuery has changed, reset page to 1 if it has
  if (searchQuery.value !== previousSearchQuery)
    page = 1 // Reset to page 1 if the search query has changed

  const formData = {
    order_no: searchQuery.value,
    order_type: 'public',
    vendor_id: authUser.value.user.user_id,
  }

  try {
    loaderStore.showLoader()

    // const response = await apiRequestObj.makeRequest(
    //   `service/search/my-orders?page=${typeof page === 'number' ? page : 1}&order_no=${searchQuery.value}&order_status=&payment_status=`,
    //   'get',
    // )
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

onMounted(() => {
  makeSearch(1)
})

watch(() => notificationStore.notifications, (newNotifications, oldNotifications) => {
  if (newNotifications.length > oldNotifications.length)
    makeSearch(1) // Call makeSearch to update the order list
}, { deep: true })
</script>

<template>
  <CustomTable
    :headers="headers"
    :data="ordersData"
    from="location"
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
            @keypress.enter="makeSearch"
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
