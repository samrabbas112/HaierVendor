<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
const router = useRouter();

router.push('/dashboard')

</script>

<template>
  <div>
    <VCard class="mb-6" title="Redirecting To Dashboard...">
    </VCard>
  </div>
</template>
