<script setup lang="ts">
const props = defineProps<{
  clickFunction: () => void
  btnText?: string
  variant?: string
  class?: string
  color?: string
  isLoading?: boolean
  block?: boolean
}>()
</script>

<template>
  <VBtn
    :block="props.block"
    :class="props.class"
    :variant="props.variant || 'flat'"
    :color="props.color || 'secondary'"
    @click="props.clickFunction"
  >
    <VProgressCircular
      v-if="props.isLoading"
      indeterminate
      color="white"
    />
    <template v-else>
      {{ props.btnText || 'Submit' }}
    </template>
  </VBtn>
</template>
