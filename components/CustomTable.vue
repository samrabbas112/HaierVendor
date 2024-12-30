<script setup lang="ts">
const { headers, data, from } = defineProps({
  headers: Array,
  data: [Array, Object],
  from: String,
})

const emit = defineEmits()

const route = useRoute()

// Data table options
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

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

console.log({ data })

const updatePage = value => {
  emit('update:page', value)
}

// Delete Orders
const deleteData = async (id: number) => {
  emit('delete:record', id)
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
          <p>{{ new Date(item.date).toLocaleString() }}</p>
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
        <!-- Vendors  -->
        <template #item.vendors="{ item }">
          <div class="d-flex align-center gap-x-3">
            <div class="d-flex flex-column">
              <div class="text-body-1 font-weight-medium">
                <NuxtLink class="text-link">
                  {{ item.vendor_name }}
                </NuxtLink>
              </div>
              <div class="text-body-2">
                {{ item.vendor_email }}
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
