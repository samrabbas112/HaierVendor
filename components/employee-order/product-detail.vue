<script setup lang="ts">
  const props = defineProps<{
    products: any
  }>()
  console.log({
    props
  })
</script>

<template>
  <div class="row">
    <div class=" col-lg-3 col-md-2  ">
      <img
        class="w-100"
        :src="props.products.productCoverImg" alt="Product image">
    </div>
    <div class="col-lg-4 col-md-4">
      <ul class="list-unstyled mt-2 text-black">
        <li> {{ props.products.productName }}</li>
        <li> Variations: {{ props.products.specName }}</li>
        <li> Quantity: {{ props.products.purchaseNum }}</li>
      </ul>
    </div>
  </div>

</template>

<style scoped lang="scss">

</style>
