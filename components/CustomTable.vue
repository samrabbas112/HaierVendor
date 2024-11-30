<script setup lang="ts">
const { headers, data, from } = defineProps({
  headers: Array,
  data: [Array, Object],
  from: String,
})

const emit = defineEmits()

const route = useRoute()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

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
  if (status === 'Exclusive')
    return { text: 'Ready to Pickup', color: 'info' }
  if (status === 'Picked')
    return { text: 'Picked', color: 'warning' }
  if (status === 'out for delivery')
    return { text: 'Out for delivery', color: 'primary' }
  if (status === 'Closed')
    return { text: 'Closed', color: 'success' }

  return { text: status, color: 'primary' }
}

const resolveMethod = (status: string) => {
  if (status === 'COD')
    return { text: 'COD', color: 'warning' }
  if (status === 'Paid')
    return { text: 'Paid', color: 'success' }
}

console.log({ data })

const updatePage = value => {
  emit('update:page', value)
}

const orders = computed((): Order[] => data?.orders)
const totalOrder = computed(() => data?.total)

// Delete Orders
const deleteData = async (id: number) => {
  emit('delete:record', id)
}
</script>

<template>
  <div>
    <VCard>
      <slot />
      <!-- 👉 Filters -->
      <VDivider />

      <!-- 👉 Order Table -->
      <VDataTableServer
        v-model:items-per-page="data.per_page"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="data?.orders"
        :items-length="data?.total"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Order ID -->
        <template #item.id="{ item }">
          {{ item.id }}
        </template>
        <template #item.order="{ item }">
          <NuxtLink> #{{ item.order }} </NuxtLink>
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          {{ new Date(item.date).toLocaleString() }}
        </template>
        <!-- time -->
        <template #item.time="{ item }">
          {{ new Date(item.time).toLocaleString() }}
        </template>

        <!-- Customers  -->
        <template #item.customer="{ item }">
          <div class="d-flex align-center gap-x-3">
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <NuxtLink class="text-link">
                  {{ item.customer }}
                </NuxtLink>
              </div>
              <div class="text-body-2">
                {{ item.mobile }}
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
            v-bind="resolveStatus(item.status)"
            label
            size="small"
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
            v-model:page="page"
            :items-per-page="data?.per_page"
            :total-items="data?.total"
            @update:page="updatePage"
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
