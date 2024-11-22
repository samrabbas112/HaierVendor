<script setup lang="ts">
import masterCardDark from '@images/icons/payments/img/master-dark.png'
import masterCardLight from '@images/icons/payments/img/mastercard.png'
import paypalDark from '@images/icons/payments/img/paypal-dark.png'
import paypalLight from '@images/icons/payments/img/paypal-light.png'


const {headers, data } = defineProps({
  headers: Array,
  data: [Array, Object],
})

const mastercard = useGenerateImageVariant(masterCardLight, masterCardDark)
const paypal = useGenerateImageVariant(paypalLight, paypalDark)

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const searchQuery = ref('')

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const resolvePaymentStatus = (status: number) => {
  if (status === 1)
    return { text: 'Paid', color: 'success' }
  if (status === 2)
    return { text: 'Pending', color: 'warning' }
  if (status === 3)
    return { text: 'Cancelled', color: 'secondary' }
  if (status === 4)
    return { text: 'Failed', color: 'error' }
}

const resolveStatus = (status: string) => {
  if (status === 'Delivered')
    return { text: 'Delivered', color: 'success' }
  if (status === 'Out for Delivery')
    return { text: 'Out for Delivery', color: 'primary' }
  if (status === 'Ready to Pickup')
    return { text: 'Ready to Pickup', color: 'info' }
  if (status === 'Dispatched')
    return { text: 'Dispatched', color: 'warning' }
}

const status = ref([
  { title: 'Scheduled', value: 'Scheduled' },
  { title: 'Publish', value: 'Published' },
  { title: 'Inactive', value: 'Inactive' },
])

console.log({ data })

const orders = computed((): Order[] => data.orders)
const totalOrder = computed(() => 100)

// Delete Orders
const deleteOrder = async (id: number) => {}
</script>

<template>
  <div>
    <VCard>
      <!-- 👉 Filters -->
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
            placeholder="Search Order"
            style=" max-inline-size: 200px; min-inline-size: 200px;"
          />
          </VCol>

          <VCol
            cols="12"
            sm="3"
          >
          <div class="d-flex">

            <!-- <VBtn
            class = "me-2"
            variant="outlined"
            color="secondary"
            >
            Reset
          </VBtn> -->
          <VBtn variant="flat">
            Search
          </VBtn>
        </div>
          </VCol>
        </VRow>
      </VCardText>
      <VDivider />

      <!-- 👉 Order Table -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="orders"
        :items-length="totalOrder"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Order ID -->
        <template #item.order="{ item }">
          <NuxtLink>
            #{{ item.order }}
          </NuxtLink>
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          {{ new Date(item.date).toDateString() }}
        </template>

        <!-- Customers  -->
        <template #item.customers="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              :color="!item.avatar.length ? 'primary' : ''"
              :variant="!item.avatar.length ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />

              <span
                v-else
                class="font-weight-medium"
              >{{
                avatarText(item.customer)
              }}</span>
            </VAvatar>

            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <NuxtLink class="text-link">
                  {{ item.customer }}
                </NuxtLink>
              </div>
              <div class="text-body-2">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Payments -->
        <template #item.payment="{ item }">
          <div
            :class="`text-${resolvePaymentStatus(item.payment)?.color}`"
            class="font-weight-medium d-flex align-center gap-x-2"
          >
            <VIcon
              icon="tabler-circle-filled"
              size="10"
            />
            <div style="line-height: 22px">
              {{ resolvePaymentStatus(item.payment)?.text }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            v-bind="resolveStatus(item.status)"
            label
            size="small"
          />
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <div class="d-flex align-center">
            <img
              :src="item.method === 'mastercard' ? mastercard : paypal"
              height="18"
            >
            <div class="text-body-1">
              ...{{
                item.method === "mastercard" ? item.methodNumber : "@gmail.com"
              }}
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem value="view" :to="{ name: 'order-details-id', params: { id: item.order } }">
                  View
                </VListItem>
                <VListItem
                  value="delete"
                  @click="deleteOrder(item.id)"
                >
                  Delete
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalOrder"
          />
        </template>
      </VDataTableServer>
    </VCard>
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
