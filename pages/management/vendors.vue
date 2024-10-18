<script setup lang="ts">
import masterCardDark from '@images/icons/payments/img/master-dark.png'
import masterCardLight from '@images/icons/payments/img/mastercard.png'
import paypalDark from '@images/icons/payments/img/paypal-dark.png'
import paypalLight from '@images/icons/payments/img/paypal-light.png'

const widgetData = ref([
  { title: 'Pending Payment', value: 56, icon: 'tabler-calendar-stats' },
  { title: 'Completed', value: 12689, icon: 'tabler-checks' },
  { title: 'Refunded', value: 124, icon: 'tabler-wallet' },
  { title: 'Failed', value: 32, icon: 'tabler-alert-octagon' },
])

const mastercard = useGenerateImageVariant(masterCardLight, masterCardDark)
const paypal = useGenerateImageVariant(paypalLight, paypalDark)

const searchQuery = ref('')

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

// Data table Headers
const headers = [
  { title: 'Order', key: 'order' },
  { title: 'Date', key: 'date' },
  { title: 'Customers', key: 'customers' },
  { title: 'Payment', key: 'payment', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Method', key: 'method', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

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

const categories = ref([
  { title: 'Accessories', value: 'Accessories' },
  { title: 'Home Decor', value: 'Home Decor' },
  { title: 'Electronics', value: 'Electronics' },
  { title: 'Shoes', value: 'Shoes' },
  { title: 'Office', value: 'Office' },
  { title: 'Games', value: 'Games' },
])

const stockStatus = ref([
  { title: 'In Stock', value: true },
  { title: 'Out of Stock', value: false },
])

// Fetch Orders
const ordersData = {
  total: 100,
  orders: [
    {
      id: 100,
      order: 9042,
      customer: 'Chere Schofield',
      email: 'cschofield2r@ucsd.edu',
      avatar: '',
      payment: 2,
      status: 'Ready to Pickup',
      spent: 815.77,
      method: 'mastercard',
      date: '2/1/2023',
      time: '4:12 PM',
      methodNumber: 3949,
    },
    {
      id: 99,
      order: 7189,
      customer: 'Boycie Hartmann',
      email: 'bhartmann2q@addthis.com',
      avatar: '',
      payment: 3,
      status: 'Out for Delivery',
      spent: 704.86,
      method: 'paypalLogo',
      date: '1/2/2023',
      time: '8:55 PM',
      methodNumber: 6424,
    },
    {
      id: 98,
      order: 8114,
      customer: 'Ulysses Goodlife',
      email: 'ugoodlife2p@blogger.com',
      avatar: '/images/avatars/avatar-2.png',
      payment: 3,
      status: 'Ready to Pickup',
      spent: 746.38,
      method: 'mastercard',
      date: '4/8/2023',
      time: '3:39 AM',
      methodNumber: 4509,
    },
    {
      id: 97,
      order: 7064,
      customer: 'Carmon Vasiljevic',
      email: 'cvasiljevic2o@odnoklassniki.ru',
      avatar: '/images/avatars/avatar-8.png',
      payment: 3,
      status: 'Delivered',
      spent: 595.25,
      method: 'paypalLogo',
      date: '3/20/2023',
      time: '3:11 PM',
      methodNumber: 4892,
    },
    {
      id: 96,
      order: 5911,
      customer: 'Hilliard Merck',
      email: 'hmerck2n@printfriendly.com',
      avatar: '',
      payment: 4,
      status: 'Out for Delivery',
      spent: 237.91,
      method: 'paypalLogo',
      date: '8/14/2022',
      time: '3:26 PM',
      methodNumber: 3196,
    },
    {
      id: 95,
      order: 6111,
      customer: 'Chad Cock',
      email: 'ccock2m@g.co',
      avatar: '',
      payment: 4,
      status: 'Ready to Pickup',
      spent: 669.45,
      method: 'mastercard',
      date: '3/11/2023',
      time: '10:43 AM',
      methodNumber: 1014,
    },
    {
      id: 94,
      order: 8767,
      customer: 'Lyndsey Dorey',
      email: 'ldorey2l@barnesandnoble.com',
      avatar: '/images/avatars/avatar-2.png',
      payment: 3,
      status: 'Ready to Pickup',
      spent: 738.42,
      method: 'mastercard',
      date: '8/29/2022',
      time: '5:24 AM',
      methodNumber: 3432,
    },
    {
      id: 93,
      order: 7931,
      customer: 'Octavius Whitchurch',
      email: 'owhitchurch2k@google.ca',
      avatar: '/images/avatars/avatar-7.png',
      payment: 3,
      status: 'Dispatched',
      spent: 383.52,
      method: 'mastercard',
      date: '12/26/2022',
      time: '9:49 AM',
      methodNumber: 8585,
    },
    {
      id: 92,
      order: 7280,
      customer: 'Sibley Braithwait',
      email: 'sbraithwait2j@webmd.com',
      avatar: '',
      payment: 1,
      status: 'Ready to Pickup',
      spent: 554.91,
      method: 'mastercard',
      date: '12/6/2022',
      time: '2:11 AM',
      methodNumber: 8535,
    },
    {
      id: 91,
      order: 7094,
      customer: 'Damara Figgins',
      email: 'dfiggins2i@de.vu',
      avatar: '',
      payment: 2,
      status: 'Delivered',
      spent: 62.62,
      method: 'mastercard',
      date: '6/29/2022',
      time: '6:51 AM',
      methodNumber: 8321,
    },
  ],
}

console.log({ ordersData })

const orders = computed((): Order[] => ordersData.orders)
const totalOrder = computed(() => ordersData.total)

// Delete Orders
const deleteOrder = async (id: number) => {}
</script>

<template>
  <div>
    <VCard>
      <!-- 👉 Filters -->
      <VCardText>
        <VRow>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select Category -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedCategory"
              placeholder="Category"
              :items="categories"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select Stock Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStock"
              placeholder="Stock"
              :items="stockStatus"
              clearable
              clear-icon="tabler-x"
            />
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
                <VListItem value="view">
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
