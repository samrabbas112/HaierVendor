<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { orderStatusCodes } from '@/libs/order/order-status'

const { headers, data, from, orderHaierStatus, selectedHaierOrderStatus, handleSelectedOrderStatus } = defineProps({
  headers: Array,
  data: [Array, Object],
  from: String,
  orderHaierStatus: {
    type: Array,
    default: () => [],
  },
  selectedHaierOrderStatus: {
    type: Object,
    default: () => ({}),
  },
  handleSelectedOrderStatus: {
    type: Function,
    required: true,
  },

})

const emit = defineEmits()
const isConfirmDialogVisible = ref(false)

// const selectedHaierOrderStatus = reactive({})

// Watch for changes to selectedHaierOrderStatus

const route = useRoute()

// Data table options
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const authStore = useAuthStore()
const authUser = authStore.user

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resolveMethod = (status: string) => {
  if (status === 'COD')
    return { text: 'COD', color: 'warning' }
  if (status === 'Card')
    return { text: 'Card', color: 'success' }
  if (status === 'EasyPaisa')
    return { text: 'EasyPaisa', color: 'error' }
  if (status === 'jazzCash')
    return { text: 'jazzCash', color: 'info' }
}

const calculateQuantity = specInfo => {
  return specInfo.reduce((total, variation) => total + (variation.purchaseNum || 0), 0)
}

const updatePage = value => {
  emit('update:page', value)
}

// Delete Orders
const deleteData = async (id: number) => {
  emit('delete:record', id)
}

const filteredOrderHaierStatus = status => {
  if (status == orderStatusCodes.isReadyToShip)
    return orderHaierStatus.filter(item => item.value == orderStatusCodes.isOutForDelivery)

  else if (status == orderStatusCodes.isOutForDelivery)
    return orderHaierStatus.filter(item => item.value == orderStatusCodes.isDelivered_Refused)

  return orderHaierStatus.filter(item => item.value ==  orderStatusCodes.isReadyToShip)
}
</script>

<template>
  <div>
    <!-- 👉 Filters -->
    <VCard class="mb-6">
      <slot />
    </VCard>
    <VCard>
      <!-- 👉 Order Table -->
      <VDataTableServer
        v-model:items-per-page="data.per_page"
        v-model:model-value="selectedRows"
        v-model:page="data.current_page"
        :headers="headers"
        :items="data?.orders"
        :items-length="data?.total"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Order ID -->
        <template #item.id="{ index }">
          <NuxtLink>
            <!-- {{ item.id }} -->
            {{ (data.current_page - 1) * data.per_page + index + 1 }}
          </NuxtLink>
        </template>
        <template #item.order="{ item }">
          <NuxtLink> {{ item.order }} </NuxtLink>
          <p style="margin: 0;">
            {{ new Date(item.date).toLocaleString() }}
          </p>
          <div class="text-body-2 text-wrap">
            <strong>Payment Method:</strong> <span>{{ item.method }}</span>
          </div>
        </template>

        <template #item.product="{ item }">
          <div
            v-for="(product, index) in item.products"
            :key="index"
            class="text-body-1 text-wrap w-100"
          >
            <div class="d-flex gap-x-3 align-center">
              <VAvatar
                size="34"
                :image="product.productCoverImg"
                :rounded="0"
              />

              <div class="d-flex flex-column align-start text-wrap w-100">
                <h6 class="text-h6">
                  {{ product.productName }}
                </h6>
                <div
                  v-for="(variation, index) in product.specInfo"
                  :key="index"
                  class="text-body-1 text-wrap w-100"
                >
                  <span class="text-body-2">
                    {{ variation.specName }}
                  </span>
                </div>
                <div class="text-body-2">
                  <strong>Quantity:</strong> <span>{{ calculateQuantity(product.specInfo) }}</span>
                  <strong>, Price:</strong> <span>{{ product.productPrice }}</span>
                </div>
                <div v-if="authUser.user_type === 'haier'" class="text-body-2">
                  <strong>Product Type:</strong> <span>{{ product.newProductType || 'N/A'}}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          {{ new Date(item.date).toLocaleString() }}
        </template>
        <!-- time -->
        <template #item.time="{ item }">
          {{ item.time ? new Date(item.time).toLocaleString() : '--:--:--' }}
        </template>

        <!-- Customers  -->
        <template #item.customer="{ item }">
          <div class="d-flex align-center gap-x-3">
            <div class="d-flex flex-column text-wrap">
              <div class="text-body-1 font-weight-medium">
                <NuxtLink class="text-link">
                  {{ item.customer }}
                </NuxtLink>
              </div>
              <div class="text-body-2">
                {{ item.mobile }}
              </div>
              <div class="text-body-2">
                {{ item.address }}
              </div>
            </div>
          </div>
        </template>
        <!-- Vendors  -->
        <template #item.vendors="{ item }">
          <div class="d-flex align-center gap-x-3 text-wrap">
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <NuxtLink class="text-link">
                  {{ item.vendor_name }}
                </NuxtLink>
              </div>
              <div class="text-body-2">
                {{ item.vendor_phone }}
              </div>
              <div class="text-body-2">
                {{ item.vendor_address }}
              </div>
            </div>
          </div>
        </template>

        <!-- Payments -->
        <template #item.payment="{ item }">
          <!--
            <div
            :class="`text-${resolvePaymentStatus(item.payment)?.color}`"
            class="font-weight-medium d-flex align-center gap-x-2"
            >
            <VIcon icon="tabler-circle-filled" size="10" />
            <div style="line-height: 22px">
            {{ resolvePaymentStatus(item.payment)?.text }}
            </div>
            </div>
          -->
          {{ item.payment }}
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            v-bind="resolveOrderStatus(item.status)"
            label
            size="small"
          />
        </template>

        <template #item.haier_order_status="{ item }">
          <AppSelect
            v-model="selectedHaierOrderStatus[item.uid]"
            placeholder="Select"
            :items="filteredOrderHaierStatus(item.status)"
            clearable
            clear-icon="tabler-x"
            :disabled="item.status == orderStatusCodes.isDeliveryRefused || item.status == orderStatusCodes.isCancelled || item.status == orderStatusCodes.isClosed"
            @update:model-value="value => handleSelectedOrderStatus(value)"
          />
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <div
            :class="`text-${resolveMethod(item.method)?.color}`"
            class="font-weight-medium d-flex align-center gap-x-2"
          >
            <VIcon
              icon="tabler-circle-filled"
              size="10"
            />
            <VChip
              v-bind="resolveMethod(item.method)"
              label
              size="small"
            />
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            v-if="route.path.startsWith('/order/')"
            :to="`/order/${from}/${item.uid}`"
          >
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn v-else>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="view"
                  :to="`/order/${from}/${item.uid}`"
                >
                  View
                </VListItem>
                <VListItem
                  value="delete"
                  @click="deleteData(item.id)"
                >
                  Deleted
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="data.current_page"
            :items-per-page="data?.per_page"
            :total-items="data?.total"
            @update:page="updatePage"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <ConfirmDialog
      v-model:isDialogVisible="isConfirmDialogVisible"
      confirmation-question="Are you sure to want to update status"
      cancel-msg="Request cancelled!!"
      cancel-title="Cancelled"
      confirm-msg="Your order status changed successfully."
      confirm-title="Confirmed"
      @confirm="handleConfirm"
    />
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
