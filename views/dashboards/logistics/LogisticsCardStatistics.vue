<script setup lang="ts">
import { computed, defineProps } from "vue";
const authStore = useAuthStore();
const customThirdCardLabel =
  authStore.user?.user_type === "vendor" ? "Total Customers" : "Total Vendors";
const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
});

const logisticData = computed(() => [
  {
    icon: "tabler-truck",
    color: "primary",
    title: "Delivered Orders",
    value: props.stats.totalOrders,
    change: 18.2,
    isHover: false,
  },
  {
    icon: "tabler-chart-pie-2",
    color: "warning",
    title: "Total Sales",
    value: props.stats.totalSales,
    change: -8.7,
    isHover: false,
  },
  {
    icon: "tabler-users",
    color: "info",
    title: customThirdCardLabel,
    value: props.stats.totalCustomer,
    change: 4.3,
    isHover: false,
  },
]);
</script>

<template>
  <VRow>
    <VCol
      v-for="(data, index) in logisticData"
      :key="index"
      cols="12"
      md="4"
      sm="6"
    >
      <div>
        <VCard
          class="logistics-card-statistics cursor-pointer"
          :style="
            data.isHover
              ? `border-block-end-color: rgb(var(--v-theme-${data.color}))`
              : `border-block-end-color: rgba(var(--v-theme-${data.color}),0.38)`
          "
          @mouseenter="data.isHover = true"
          @mouseleave="data.isHover = false"
        >
          <VCardText>
            <div class="d-flex align-center gap-x-4 mb-1">
              <VAvatar variant="tonal" :color="data.color" rounded>
                <VIcon :icon="data.icon" size="28" />
              </VAvatar>
              <h4 class="text-h4">
                {{ data.value }}
              </h4>
            </div>
            <div class="text-body-1 mb-1">
              {{ data.title }}
            </div>
          </VCardText>
        </VCard>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics {
  border-block-end-style: solid;
  border-block-end-width: 2px;

  &:hover {
    border-block-end-width: 3px;
    margin-block-end: -1px;

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}

.skin--bordered {
  .logistics-card-statistics {
    border-block-end-width: 2px;

    &:hover {
      border-block-end-width: 3px;
      margin-block-end: -2px;
      transition: all 0.1s ease-out;
    }
  }
}
</style>
