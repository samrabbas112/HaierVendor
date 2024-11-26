<script setup lang="ts">

const { headers, data } = defineProps({
  headers: Array,
  data: [Array, Object],
});

const emit = defineEmits();

const route = useRoute();

// Data table options
const itemsPerPage = ref(10);
const page = ref(1);
const sortBy = ref();
const orderBy = ref();
const selectedRows = ref([]);

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key;
  orderBy.value = options.sortBy[0]?.order;
};

const resolvePaymentStatus = (status: number) => {
  if (status === 1) return { text: "Paid", color: "success" };
  if (status === 2) return { text: "Pending", color: "warning" };
  if (status === 3) return { text: "Cancelled", color: "secondary" };
  if (status === 4) return { text: "Failed", color: "error" };
};

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
  if (status === "COD") return { text: "COD", color: "warning" };
  if (status === "Paid")
    return { text: "Paid", color: "success" };
};

console.log({ data });

const updatePage = (value) => {
  emit("update:page", value);
};

const orders = computed((): Order[] => data?.orders);
const totalOrder = computed(() => data?.total);

// Delete Orders
const deleteData = async (id: number) => {
  emit("delete:record", id);
};
</script>

<template>
  <div>
    <SnackBar />
    <VCard>
      <slot />
      <!-- 👉 Filters -->
      <VDivider />

      <!-- 👉 Order Table -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
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
          {{ new Date(item.date).toLocaleString('en-Us', dateTimeOptions) }}
        </template>
        <!-- time-->
        <template #item.time="{ item }">
          {{ new Date(item.time).toLocaleString('en-Us', dateTimeOptions) }}
        </template>

        <!-- Customers  -->
        <template #item.customers="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              :color="!item.avatar.length ? 'primary' : ''"
              :variant="!item.avatar.length ? 'tonal' : undefined"
            >
              <VImg v-if="item.avatar" :src="item.avatar" />

              <span v-else class="font-weight-medium">{{
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
            <VIcon icon="tabler-circle-filled" size="10" />
            <div style="line-height: 22px">
              {{ resolvePaymentStatus(item.payment)?.text }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip v-bind="resolveStatus(item.status)" label size="small" />
        </template>

        <!-- Method -->
        <template #item.method="{ item }">
          <VChip v-bind="resolveMethod(item.method)" label size="small" />
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            v-if="route.path.startsWith('/order/')"
            :to="{ name: 'order-details-id', params: { id: item.order } }"
          >
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn v-else>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="view"
                  :to="{ name: 'order-details-id', params: { id: item.order } }"
                >
                  View
                </VListItem>
                <VListItem value="delete" @click="deleteData(item.id)">
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
            :items-per-page="itemsPerPage"
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
