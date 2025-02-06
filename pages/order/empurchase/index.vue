<script setup lang="ts">
import { ref } from 'vue'

const orderNo = ref('')
const orderStatus = ref('Select Order Status')
const selectedPaymentMethod = ref('Select Payment Method')

// Data table Headers
const headers = [
  { title: 'Sr no#', key: 'sr', sortable: false },
  { title: 'Form no', key: 'no', sortable: false },
  { title: 'Emp.Code', key: 'code', sortable: false },
  { title: 'Emp.Name', key: 'name', sortable: false },
  { title: 'Designation', key: 'des', sortable: false },
  { title: 'Total Limit', key: 'limit', sortable: false },
  { title: 'Used Limit', key: 'uselimit', sortable: false },
  { title: 'P.Category', key: 'cat', sortable: false },
  { title: 'Payment Detail', key: 'pay', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

// Static data for the table
const ordersData = [
  {
    sr: 1,
    no: 'F-101',
    code: 'EMP001',
    name: 'John Doe',
    des: 'Software Engineer',
    limit: '$5000',
    uselimit: '$2000',
    cat: 'A',
    pay: 'Credit Card',
    status: 'Approved',
    actions: 'View Details',
  },
  {
    sr: 2,
    no: 'F-102',
    code: 'EMP002',
    name: 'John Doe',
    des: 'Software Engineer',
    limit: '$5000',
    uselimit: '$2000',
    cat: 'A',
    pay: 'Credit Card',
    status: 'Approved',
    actions: 'View Details',
  },
]

const paymentMethods = [
  { title: 'COD', value: 'COD' },
  { title: 'Card', value: 'Card' },
  { title: 'EasyPaisa', value: 'EasyPaisa' },
  { title: 'jazzCash', value: 'jazzCash' },
]

const orderStatusList = [
  { title: 'APPROVED', value: 'approved' },
  { title: 'PENDING', value: 'pending' },
  { title: 'REJECTED', value: 'rejected' },
]
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
              v-model="orderNo"
              placeholder="Search Order#"
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
              >
                Reset
              </VBtn>
              <VBtn variant="flat">
                Search
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VDataTableServer
      :items="ordersData"
      item-value="id"
      :headers="headers"
      class="text-no-wrap"
    >
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
