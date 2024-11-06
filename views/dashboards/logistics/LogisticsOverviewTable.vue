<script setup lang="ts">
const props = defineProps<{
  data: Array<{
    createdDate: string;
    orderNo: string;
    price: number;
    paymentMethod: string;
    status: string;
  }>
}>()

const page = ref(1);
const sortBy = ref();
const orderBy = ref();


// const vehiclesData = {
//   totalVehicles: 25,
//   vehicles: [
//     {
//       created_at: "2024-10-01T12:30:00Z",
//       order_no: 1001,
//       price: 120.5,
//       payment_method: "Credit Card",
//       status: "Completed",
//     },
//     {
//       created_at: "2024-10-02T08:15:00Z",
//       order_no: 1002,
//       price: 75.99,
//       payment_method: "PayPal",
//       status: "Pending",
//     },
//     {
//       created_at: "2024-10-03T10:45:00Z",
//       order_no: 1003,
//       price: 49.99,
//       payment_method: "Debit Card",
//       status: "Cancelled",
//     },
//     {
//       created_at: "2024-10-04T14:00:00Z",
//       order_no: 1004,
//       price: 200.0,
//       payment_method: "Bank Transfer",
//       status: "Processing",
//     },
//     {
//       created_at: "2024-10-05T16:25:00Z",
//       order_no: 1005,
//       price: 150.75,
//       payment_method: "Credit Card",
//       status: "Completed",
//     },
//   ],
// };

// const vehicles = computed((): Vehicle[] => vehiclesData.vehicles);
// const totalVehicles = computed(() => vehiclesData.totalVehicles);
const vehicles = computed((): Vehicle[] => props?.data);
const totalVehicles = computed(() => props?.data.length);

const headers = [
  { title: "CREATION TIME", key: "created_at" },
  { title: "ORDER NO", key: "order_no" },
  { title: "PRODUCT PRICE", key: "price" },
  { title: "PAYMENT METHOD", key: "payment_method" },
  { title: "STATUS", key: "status" },
];

const resolveChipColor = (warning: string) => {
  if (warning === "Completed") return "success";
  if (warning === "Completed") return "primary";
  if (warning === "Pending") return "warning";
  if (warning === "Cancelled") return "error";
  if (warning === "Processing") return "info";
  return "info";
}

const formattedDate = unFormattedDate => {
  return new Date(unFormattedDate).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    },
  )
}
</script>

<template>
  <VCard>
    <VCardItem title="My Orders">
      <template #append> </template>
    </VCardItem>
    <VDivider />
    <VDataTableServer
      :items-length="totalVehicles"
      :items="vehicles"
      item-value="order_no"
      :headers="headers"
      class="text-no-wrap"
    >
      <template #item.created_at="{ item }">
        <div class="text-link text-base font-weight-medium d-inline-block">
          {{ formattedDate(item.created_at) }}
        </div>
      </template>

      <template #item.order_no="{ item }">
        {{ item.order_no }}
      </template>

      <template #item.price="{ item }">
        {{ item.price }}
      </template>

      <template #item.payment_method="{ item }">
        {{ item.payment_method }}
      </template>

      <template #item.status="{ item }">
        <VChip :color="resolveChipColor(item.status)" label size="small">
          {{ item.status }}
        </VChip>
      </template>
      <template #bottom> </template>
    </VDataTableServer>
    <VCardItem>
      <template #append> </template>
    </VCardItem>
  </VCard>
</template>
