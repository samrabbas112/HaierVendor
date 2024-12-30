<script setup lang="ts">
// Props for passing data to the component
defineProps(['orderData', 'orderDetail', 'subtotal', 'Total', 'userData'])

definePageMeta({
  layout: 'blank',
  public: true,
})

const printArea = ref()

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

const handlePrint = async e => {
  e.preventDefault()

  const printContents = printArea.value.innerHTML
  const printWindow = window.open('', '_blank')

  printWindow.document.write('<html><head><title>Haier</title></head><body>')
  printWindow.document.write(printContents)
  printWindow.document.write('</body></html>')
  printWindow.document.close()

  printWindow.print()
}
</script>

<template>
  <VBtn
    variant="tonal"
    color="primary"
    @click="handlePrint"
  >
    Print
  </VBtn>
  <div
    ref="printArea"
    style="display: none;"
  >
    <div style="display: flex; flex-direction: column;">
      <!-- Order number and status -->
      <div style="display: flex; gap: 4px; align-items: center; flex-wrap: nowrap;">
        <h5 style="font-size: 1.25rem; font-weight: bold; margin: 0;">
          Order #{{ orderData?.order }}:
        </h5>
        <div style="margin-left: 2px;">
          {{ orderData?.status }}
        </div>
      </div>

      <!-- Date on a new line -->
      <div style="margin-top: 4px;">
        {{ new Date(orderData?.date).toLocaleString() }}
      </div>
    </div>

    <div style="display: flex; gap: 4px; align-items: center; flex-wrap: nowrap;">
      <h5 style="font-size: 1.25rem; font-weight: bold; margin: 0;">
        Payment Method:
      </h5>
      <div style="display: flex; gap: 4px; margin-left: 2px;">
        {{ orderData?.method }}
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; margin-top: 25px; padding: 16px;">
      <!-- Order Details Section -->
      <div style="flex: 1; max-width: 100%;">
        <div style="margin-bottom: 24px; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="padding: 5px; border-bottom: 1px solid #e0e0e0;">
            <h5 style="font-size: 1.25rem; margin: 15px; font-weight: bold;">
              Order Details
            </h5>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                  Product Name
                </th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                  Price
                </th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                  Variations
                </th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in orderDetail"
                :key="index"
              >
                <td style="padding: 8px;">
                  <div style="display: flex; gap: 12px; align-items: center;">
                    <img
                      :src="item.productImage"
                      alt="Product Image"
                      style="width: 34px; height: 34px; border-radius: 4px;"
                    >
                    <div>
                      <h6 style="font-size: 1rem; margin: 0;">
                        {{ item.productName }}
                      </h6>
                      <span style="font-size: 0.875rem; color: #6c757d;">{{ item.subtitle }}</span>
                    </div>
                  </div>
                </td>
                <td style="padding: 8px; font-size: 1rem;">
                  {{ item.total }}
                </td>
                <td style="padding: 8px; font-size: 1rem;">
                  <div
                    v-for="variation in item.variations"
                    style="margin-bottom: 4px;"
                  >
                    {{ variation.name }}
                  </div>
                </td>
                <td style="padding: 8px; font-size: 1rem;">
                  <div
                    v-for="variation in item.variations"
                    style="margin-bottom: 4px;"
                  >
                    {{ variation.quantity }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="border-top: 1px solid #e0e0e0; padding: 16px; text-align: right;">
            <table style="margin: 0;">
              <tr>
                <td style="padding-right: 16px; font-weight: bold;">
                  Total:
                </td>
                <td style="font-weight: bold;">
                  PKR {{ Total }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Customer and Shipping Details Section -->
      <div style="display: flex; flex-wrap: wrap; width: 100%;  flex-direction: column;">
        <div>
          <div style="margin-bottom: 24px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px;">
            <h5 style="font-size: 1.25rem; font-weight: bold;">
              Customer Details
            </h5>
            <p style="margin: 8px 0; font-size: 1rem;">
              Customer Name: {{ userData?.fullName }}
            </p>
            <p style="margin: 8px 0; font-size: 1rem;">
              Mobile: {{ userData?.contact }}
            </p>
          </div>
        </div>
        <div>
          <div style="margin-bottom: 24px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px;">
            <h5 style="font-size: 1.25rem; font-weight: bold;">
              Shipping Address
            </h5>
            <p style="margin: 8px 0; font-size: 1rem;">
              {{ userData?.address }}<br>
              {{ userData?.city }}<br>
              {{ userData?.province }} {{ userData?.country }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
