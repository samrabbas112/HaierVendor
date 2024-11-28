<script setup lang="ts">
const apiRequestObj = useApi();
const snackbarStore = useSnackbarStore();
const loaderStore = useLoaderStore();

const searchQuery = ref("");
const ordersData = ref({
  total: 0,
  orders: [],
});

// Data table Headers
const headers = [
  { title: "Order#", key: "order", sortable: false },
  { title: "Total Price", key: "spent", sortable: false },
  { title: "Customers", key: "customers", sortable: false },
  { title: "Payment Method", key: "method", sortable: false },
  { title: "Placed At", key: "date", sortable: false },
  { title: "Deliver Before", key: "time", sortable: false },
  { title: "Status", key: "status" , sortable: false},
  { title: "Action", key: "actions", sortable: false },
];

const transformData = (apiResponse) => {
  return apiResponse.map((item) => {
    const payload = JSON.parse(item.payload) || {};
    const vendor = item.vendor || {};
    const internalMovement = item.internal_movement || {};
    const pickStatus = item.pick_status || {};

    return {
      id: item.id,
      order: item.order_no,
      customer: payload.consignee || "N/A",
      email: vendor.email || "N/A",
      avatar: "", // Default empty avatar
      payment: parseFloat(item.paymentAmount) || 0,
      status: pickStatus.name || "Unknown",
      spent: parseFloat(item.paymentAmount) || 0, // Assuming spent = paymentAmount
      method: payload.channel || "Unknown", // Payment method
      // date: new Date(item.created_at).toLocaleString("en-US", dateTimeOptions),
      date: item.created_at,
      time: new Date(item.created_at).getTime() + 60 * 60 * 1000, // One hour later
      methodNumber: item.id, // Placeholder for method number
    };
  });
};


let previousSearchQuery = "";
const makeSearch = async (page) => {
  // return console.log("search api hit", typeof page, searchQuery.value, page);
  console.log("search function hit", searchQuery.value, page);

  // Check if searchQuery has changed, reset page to 1 if it has
  if (searchQuery.value !== previousSearchQuery) {
    page = 1; // Reset to page 1 if the search query has changed
  }

  try {
    loaderStore.showLoader();
    const response = await apiRequestObj.makeRequest(
      `service/search/my-orders?page=${typeof page === "number" ? page : 1}&order_no=${searchQuery.value}&order_status=&payment_status=`,
      "get",
    );

    if (response && response.success) {
      // Transform and set the data
      ordersData.value = {
        total: response?.data?.total, // Set total count of orders
        orders: transformData(response?.data?.data),
      };
    } else {
      snackbarStore.showSnackbar(
        "An error occurred. Please try again.",
        "error",
      );
    }
  } catch (error) {
    snackbarStore.showSnackbar("An error occurred. Please try again.", "error");
  } finally {
    loaderStore.hideLoader();
  }

  // Update the previous search query to the current one
  previousSearchQuery = searchQuery.value;
};

onMounted(() => {
  makeSearch(1);
});
</script>

<template>
  <CustomTable :headers="headers" :data="ordersData" @update:page="makeSearch"  from="my">
    <VCardText>
      <VRow cols="12" sm="8">
        <!-- 👉 Select Status -->
        <VCol cols="12" sm="3">
          <AppTextField v-model="searchQuery" placeholder="Search Order#" />
        </VCol>

        <VCol cols="12" sm="3">
          <div class="d-flex">
            <VBtn
              class="me-2"
              variant="outlined"
              color="secondary"
              @click="() => {
                searchQuery = '';
                makeSearch(1)
              }"
            >
              Reset
            </VBtn>
            <VBtn variant="flat" @click="makeSearch"> Search </VBtn>
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
