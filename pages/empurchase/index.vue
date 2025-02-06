<script setup lang="ts">
import {ref, watch} from 'vue'

const apiRequestObj = useApi()
const snackbarStore = useSnackbarStore()
const loaderStore = useLoaderStore()
const authStore = useAuthStore()

const employeeCode = ref('')
const employeeName = ref('')
const orderStatus= ref('0')
const page = ref(1);
const orderUrl = ref('history');
// Data table Headers
const headers = [
  { title: 'Sr no#', key: 'id', sortable: false },
  { title: 'Form no', key: 'form_number', sortable: false },
  { title: 'Emp.Code', key: 'employee_id', sortable: false },
  { title: 'Emp.Name', key: 'employee_name', sortable: false },
  { title: 'Designation', key: 'designation', sortable: false },
  { title: 'Total Limit', key: 'limit', sortable: false },
  { title: 'Used Limit', key: 'used', sortable: false },
  { title: 'Total Amount', key: 'payment_amount', sortable: false },
  { title: 'Payment Type', key: 'installments_check', sortable: false },
  { title: 'Payment Details', key: 'installment_payable_amount', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

// Static data for the table
const ordersData = ref({
  per_page: 10,
  current_page: 1,
  total: 0,
  employeeOrders: [],
})

const orderStatusList = [
  { title: 'APPROVED', value: '1' },
  { title: 'PENDING', value: '0' },
  { title: 'REJECTED', value: '2' },
]


const makeSearch = async (page) => {
  const formData = {
    employeeCode: employeeCode.value,
    employeeName: employeeName.value,
    orderStatus: orderStatus.value,
  }
  console.log('================');
  console.log({ formData });
  console.log('=================');
  try {
    loaderStore.showLoader()
    const response = await apiRequestObj.makeRequest(
      `haier/employee-order/list?page=${page}`,
      'post',
      formData,
    );
    console.log(response?.data.employeeOrders);
    if (response && response.success) {
      // Transform and set the data
      ordersData.value = {
        per_page: response?.data?.per_page,
        current_page: response?.data?.currentPage,
        total: response?.data?.total, // Set total count of orders
        employeeOrders: response?.data?.employeeOrders,
      };
    } else if (response?.code === 401 || response?.message === "Unauthenticated.") {
      snackbarStore.showSnackbar("Login session expired", "error");
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
}

onMounted(() => {
  makeSearch(1);
  orderUrl.value = authStore.user.user_type == 'finance' ? 'finance' : 'sod';
});


const resolveMethod = (status: number) => {
  if (status === 1)
    return { text: 'Approved', color: 'success' }
  if (status === 2)
    return { text: 'Rejected', color: 'error' }
  return { text: 'Pending', color: 'warning' }
}

watch([orderStatus], () => {
  page.value = 1;
  makeSearch(page.value);
});

watch([page], () => {
  makeSearch(page.value);
});


</script>

<template>
  <div>
    <VCard class="mb-6">
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
              v-model="employeeCode"
              placeholder="Employee Code"
              @keypress.enter="
                () => {
                  page = 1;
                  makeSearch(page);
                }
              "
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppTextField
              v-model="employeeName"
              placeholder="Employee Name"
              @keypress.enter="
                () => {
                  page = 1;
                  makeSearch(page);
                }
              "
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppSelect
              v-model="orderStatus"
              placeholder="Select Order Status"
              :items="orderStatusList"
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
                  employeeCode = '';
                  employeeName = '';
                  orderStatus = '0';
                  page = 1;
                  makeSearch(page);
                }"
              >
                Reset
              </VBtn>
              <VBtn variant="flat"
              @click="() => {page = 1; makeSearch(page)}">
                Search
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VDataTableServer
      :items="ordersData.employeeOrders"
      item-value="id"
      :headers="headers"
      class="text-no-wrap"
    >

      <template #item.status="{ item }">
        <VChip  v-bind="resolveMethod(item.status)" label size="small" />
      </template>
      <template #item.actions="{ item }">

          <VBtn
            color="primary"
            :to="`/empurchase/${orderUrl}/${item.order_id}`"
          >
            <VIcon>tabler-eye</VIcon>
          </VBtn>

      </template>
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="ordersData.per_page"
          :total-items="ordersData.total"
        />
      </template>
    </VDataTableServer>

  </div>
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
