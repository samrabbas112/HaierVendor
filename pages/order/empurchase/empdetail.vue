<script setup lang="ts">
import { ref } from 'vue';

const orderStatus = ref('Select Order Status')
const orderNo = ref('')

const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Variation', key: 'variations' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Placed At', key: 'place' },
  { title: 'City', key: 'city' },
  { title: 'Price', key: 'price' },
  { title: 'Total', key: 'total' },
]

const orderStatusList = [
  { title: 'APPROVED', value: 'approved' },
  { title: 'PENDING', value: 'pending' },
  { title: 'REJECTED', value: 'rejected' },
]
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
      <div>
        <div class="d-flex gap-2 align-center mb-2 flex-wrap">
          <h5 class="text-h5">
            Order #m1665894853017
          </h5>
          <div class="d-flex gap-x-2">
            <VChip
              label
              size="small"
            >
              Pending
            </VChip>
          </div>
        </div>
        <div class="text-body-1">
          2024-10-27 16:24:12
        </div>
      </div>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="8"
      >
        <!-- 👉 Order Details -->
        <VCard class="mb-6">
          <VCardItem>
            <template #title>
              <h5 class="text-h5">
                Order Details
              </h5>
            </template>
          </VCardItem>

          <VDivider />
          <VDataTable
            :headers="headers"
            item-value="productName"
            class="text-no-wrap"
          >
            <template #item.productName="{ item }">
              <div class="d-flex gap-x-3 align-center">
                <VAvatar
                  size="34"
                  :image="item.productImage"
                  :rounded="0"
                />

                <div class="d-flex flex-column align-start">
                  <h6 class="text-h6">
                    {{ item.productName }}
                  </h6>

                  <span class="text-body-2">
                    {{ item.subtitle }}
                  </span>
                </div>
              </div>
            </template>

            <template #item.price="{ item }">
              <div class="text-body-1">
                {{ item.price }}
              </div>
            </template>

            <template #item.total="{ item }">
              <div class="text-body-1">
                {{ item.total }}
              </div>
            </template>

            <template #item.variations="{ item }">
              <div
                v-for="(variation, index) in item.variations"
                :key="index"
                class="text-body-1"
              >
                {{ variation.name }}
              </div>
            </template>
            <template #item.quantity="{ item }">
              <div
                v-for="(variation, index) in item.variations"
                :key="index"
                class="text-body-1"
              >
                {{ variation.quantity }}
              </div>
            </template>
            <!-- </div> -->

            <template #bottom />
          </VDataTable>
          <VDivider />

          <VCardText>
            <div class="d-flex align-end flex-column">
              <table class="text-high-emphasis">
                <tbody>
                  <tr>
                    <td width="200px">
                      Subtotal:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR</span>1200
                    </td>
                  </tr>
                  <tr>
                    <td class="text-high-emphasis font-weight-medium">
                      Total:
                    </td>
                    <td class="font-weight-medium">
                      <span class="font-weight-light">PKR</span>1500
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <!-- 👉 Customer Details  -->
        <VCard class="mb-6">
          <VCardText class="d-flex flex-column gap-y-6">
            <h5 class="text-h5">
              Status
            </h5>

            <VRow
              cols="12"
              sm="8"
            >
              <!-- 👉 Select Status -->
              <VCol
                cols="12"
                sm="12"
              >
                <AppTextField
                  v-model="orderNo"
                  label="Finance Code"
                  placeholder="Search Order#"
                />
              </VCol>
            </VRow>
            <VRow
              cols="12"
              sm="8"
            >
              <VCol
                cols="12"
                sm="12"
              >
                <AppSelect
                  v-model="orderStatus"
                  label="Select Status"
                  placeholder="Select Order Status"
                  :items="orderStatusList"
                  clearable
                  clear-icon="tabler-x"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.remove-btn {
  position: absolute;
  top: 30px;
  right: 0px;
}
.preview-container {
  position: relative;
  display: inline-block;
}
</style>
