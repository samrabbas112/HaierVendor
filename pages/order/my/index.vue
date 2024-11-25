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
  { title: "Order#", key: "order" },
  { title: "Total Price", key: "spent" },
  { title: "Customers", key: "customers" },
  { title: "Payment Method", key: "method", sortable: false },
  { title: "Placed At", key: "date" },
  { title: "Deliver Before", key: "time" },
  { title: "Status", key: "status" },
  { title: "Action", key: "actions", sortable: false },
];

// const ordersData = {
//   total: 100,
//   orders: [
//     {
//       id: 100,
//       order: 9042,
//       customer: "Chere Schofield",
//       email: "cschofield2r@ucsd.edu",
//       avatar: "",
//       payment: 2,
//       status: "Ready to Pickup",
//       spent: 815.77,
//       method: "mastercard",
//       date: "2/1/2023",
//       time: "4:12 PM",
//       methodNumber: 3949,
//     },
//     {
//       id: 99,
//       order: 7189,
//       customer: "Boycie Hartmann",
//       email: "bhartmann2q@addthis.com",
//       avatar: "",
//       payment: 3,
//       status: "Out for Delivery",
//       spent: 704.86,
//       method: "paypalLogo",
//       date: "1/2/2023",
//       time: "8:55 PM",
//       methodNumber: 6424,
//     }
//   ],
// };

const transformData = (apiResponse) => {
  return apiResponse.map((item) => {
    const payload = item.payload || {};
    const vendor = item.vendor || {};
    const internalMovement = item.internal_movement || {};

    return {
      id: item.id,
      order: item.order_no,
      customer: payload.consignee || "N/A",
      email: vendor.email || "N/A",
      avatar: "", // Default empty avatar
      payment: parseFloat(item.paymentAmount) || 0,
      status: internalMovement.name || "Unknown",
      spent: parseFloat(item.paymentAmount) || 0, // Assuming spent = paymentAmount
      method: payload.channel || "Unknown", // Payment method
      date: new Date(item.created_at).toLocaleDateString(),
      time: new Date(item.created_at).toLocaleTimeString(),
      methodNumber: item.id, // Placeholder for method number
    };
  });
};

// const makeSearch = async (page) => {
//   // return console.log("search api hit", typeof page, searchQuery.value, page);
//   console.log("search function hit", searchQuery.value, page);
//   if (!isEmpty(searchQuery.value)) {
//     try {
//       loaderStore.showLoader();
//       const response = await apiRequestObj.makeRequest(
//         "admin/authentication/reset-password",
//         "get",
//         "",
//         searchQuery.value,
//       );

//       if (response && response.success) {
//         snackbarStore.showSnackbar(
//           "Password has been changed successfully",
//           "success",
//         );
//         await router.push("/login");
//       } else {
//         snackbarStore.showSnackbar(
//           "An error occurred. Please try again.",
//           "error",
//         );
//       }
//     } catch (error) {
//       snackbarStore.showSnackbar(
//         "An error occurred. Please try again.",
//         "error",
//       );
//     } finally {
//       loaderStore.hideLoader();
//     }
//   } else {
//     snackbarStore.showSnackbar("Please enter valid order number", "error");
//   }
// };

const makeSearch = async (page) => {
  // return console.log("search api hit", typeof page, searchQuery.value, page);
  console.log("search function hit", searchQuery.value, page);

  try {
    loaderStore.showLoader();
    const response = await apiRequestObj.makeRequest(
      `service/search/my-orders?page=${page}&order_no=${searchQuery.value}&order_status=&payment_status=`,
      "get",
    );

    if (response && response.success) {
      // Transform and set the data
      ordersData.value = {
        total: response?.data?.total, // Set total count of orders
        orders: transformData(response?.data?.data),
      }
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
};

onMounted(() => {
  makeSearch(1);
});
</script>

<template>
  <CustomTable :headers="headers" :data="ordersData" @update:page="makeSearch">
    <VCardText>
      <VRow cols="12" sm="8">
        <!-- 👉 Select Status -->
        <VCol cols="12" sm="3">
          <AppTextField v-model="searchQuery" placeholder="Search Order#" />
        </VCol>

        <VCol cols="12" sm="3">
          <div class="d-flex">
            <!-- <VBtn
            class = "me-2"
            variant="outlined"
            color="secondary"
            >
            Reset
          </VBtn> -->
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
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), var(--v-border-opacity));
  padding-block-end: 1rem;
}
</style>
