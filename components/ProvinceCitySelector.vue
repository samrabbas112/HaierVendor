<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSnackbarStore } from '@/stores/snackbar';
import {
  requiredValidator,
  minLengthValidator,
  numberValidator,
  phoneValidator
} from "@/utils/validators";

const props = defineProps({
  selectedProvinceId: Number,
  selectedCityId: Number,
});

const emit = defineEmits(['update:selectedProvinceId', 'update:selectedCityId']);

const provinces = ref([]);
const cities = ref([]);
const snackBarStore = useSnackbarStore();
const apiRequestObj = useApi();

const fetchProvinces = async () => {
  try {
    const response = await apiRequestObj.makeRequest('common/provinces', 'get');
    provinces.value = response.data.map(province => ({
      value: province.id,
      title: province.name,
    }));
    if (provinces.value.length > 0 && props.selectedProvinceId !== undefined) {
      emit('update:selectedProvinceId', provinces.value[0]?.value); // Set default province
    }
  } catch (error) {
    snackBarStore.showSnackbar('Failed to load provinces', 'error');
  }
};

const fetchCities = async (provinceId: number) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/cities/${provinceId}`, 'get');
    cities.value = response.data.map(city => ({
      value: city.id,
      title: city.name,
    }));
  } catch (error) {
    snackBarStore.showSnackbar('Failed to load cities', 'error');
  }
};

// Watch province selection and load cities
watch(() => props.selectedProvinceId, (newProvinceId) => {
  if (newProvinceId) {
    fetchCities(newProvinceId);
  }
}, { immediate: true });

// Fetch provinces on mount
onMounted(() => {
    console.log(props.selectedProvinceId);
    console.log(props.selectedCityId);
  fetchProvinces();
});
</script>

<template>
    <VLabel>Province</VLabel>
    <VSelect
    class="mb-2"
      v-model="props.selectedProvinceId"
      :items="provinces"
      item-text="title"
      item-value="value"
      :rules="[requiredValidator]"
      :placeholder="!props.selectedProvinceId ? 'Select Province' : ''"
      @update:model-value="(value) => emit('update:selectedProvinceId', value)"
    />
    <VLabel>City</VLabel>
    <VSelect
    v-model="props.selectedCityId"
    :items="cities"
    item-text="title"
    item-value="value"
    :placeholder="props.selectedCityId ? '' : 'Select City'"
    :rules="[requiredValidator]"
    :disabled="!props.selectedProvinceId"
    @update:model-value="(value) => emit('update:selectedCityId', value)"
  />
    
</template>
<style scoped>
/* Add styling if necessary */
</style>
