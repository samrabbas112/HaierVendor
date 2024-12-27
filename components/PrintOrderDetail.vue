<script setup lang="ts">
// Props for passing data to the component
defineProps(['orderData', 'orderDetail', 'subtotal', 'Total', 'userData'])

definePageMeta({
  layout: 'blank',
  public: true,
})

const printArea = ref()

const handlePrint = async (e) => {
  e.preventDefault();
  // const printContents = printArea.value.innerHTML
  const printWindow = window.open('', '_blank')

  printWindow.document.write('<html><head><title>Haier</title></head><body>');
  printWindow.document.write(`<h2 style="text-align: center; color: #333;">Product Table</h2>

  <table style="width: 100%; margin: 0 auto; border-collapse: collapse; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <thead>
      <tr>
        <th style="padding: 12px 15px; text-align: left; background-color: #4CAF50; color: white; font-weight: bold; border: 1px solid #ddd;">Product</th>
        <th style="padding: 12px 15px; text-align: left; background-color: #4CAF50; color: white; font-weight: bold; border: 1px solid #ddd;">Price</th>
        <th style="padding: 12px 15px; text-align: left; background-color: #4CAF50; color: white; font-weight: bold; border: 1px solid #ddd;">Quantity</th>
        <th style="padding: 12px 15px; text-align: left; background-color: #4CAF50; color: white; font-weight: bold; border: 1px solid #ddd;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">Product 1</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">$10</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">2</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">$20</td>
      </tr>
      <tr>
        <td style="padding: 12px 15px; text-align: left; background-color: #f2f2f2; color: #333; border: 1px solid #ddd;">Product 2</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #f2f2f2; color: #333; border: 1px solid #ddd;">$15</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #f2f2f2; color: #333; border: 1px solid #ddd;">3</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #f2f2f2; color: #333; border: 1px solid #ddd;">$45</td>
      </tr>
      <tr>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">Product 3</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">$20</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">1</td>
        <td style="padding: 12px 15px; text-align: left; background-color: #fff; color: #333; border: 1px solid #ddd;">$20</td>
      </tr>
      <tr style="font-weight: bold; background-color: #e0e0e0;">
        <td colspan="3" style="padding: 12px 15px; text-align: left; border: 1px solid #ddd;">Total</td>
        <td style="padding: 12px 15px; text-align: left; border: 1px solid #ddd;">$85</td>
      </tr>
    </tbody>
  </table>`)
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
</template>
