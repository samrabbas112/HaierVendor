<script setup lang="ts">
const props = defineProps<{
  clickFunction: () => void;
  btnText?: string;
  variant?: string;
  class?: string;
  color?: string;
  isLoading?: boolean;
  block?: boolean;
}>();
</script>

<template>
  <VBtn
    :block="props.block"
    :class="props.class"
    :variant="props.variant || 'flat'"
    :color="props.color || 'primary'"
    @click="props.clickFunction"
    :type="props.type || button"
  >
    <VProgressCircular v-if="props.isLoading" indeterminate color="white" />
    <template v-else>
      {{ props.btnText || "Submit" }}
    </template>
  </VBtn>
</template>
