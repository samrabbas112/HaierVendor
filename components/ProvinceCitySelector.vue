<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useSnackbarStore } from "@/stores/snackbar";
import {
  minLengthValidator,
  numberValidator,
  phoneValidator,
  requiredValidator,
} from "@/utils/validators";

const props = defineProps({
  selectedProvinceId: Number,
  selectedCityId: Number,
  addClass: Boolean,
  mode: {
    type: String,
    default: null, // Default mode is null
  },
});

const emit = defineEmits([
  "update:selectedProvinceId",
  "update:selectedCityId",
]);

const provinces = ref([]);
const cities = ref([]);
const snackBarStore = useSnackbarStore();
const apiRequestObj = useApi();

const fetchProvinces = async () => {
  try {
    const response = await apiRequestObj.makeRequest("common/provinces", "get");

    provinces.value = response.data.map((province) => ({
      value: province.id,
      title: province.name,
    }));
    if (provinces.value.length > 0 && props.selectedProvinceId !== undefined)
      emit("update:selectedProvinceId", provinces.value[0]?.value); // Set default province
  } catch (error) {
    snackBarStore.showSnackbar("Failed to load provinces", "error");
  }
};

const fetchCities = async (provinceId: number) => {
  try {
    const response = await apiRequestObj.makeRequest(
      `common/cities/${provinceId}`,
      "get",
    );

    cities.value = response.data.map((city) => ({
      value: city.id,
      title: city.name,
    }));
  } catch (error) {
    snackBarStore.showSnackbar("Failed to load cities", "error");
  }
};


// Watch province selection and load cities
watch(
   () => props.selectedProvinceId,
  async (newProvinceId, oldProvinceId) => {
    if (newProvinceId && oldProvinceId == undefined) {
      await fetchCities(newProvinceId);
    } else if (newProvinceId !== oldProvinceId) {
      emit("update:selectedCityId", undefined); // Reset selected city
      await fetchCities(newProvinceId);
    }
  },
  { immediate: true },
);


// Fetch provinces on mount
onMounted(() => {
  
  fetchProvinces();

});
</script>

<template>
  <VCol cols="12" :sm="props.addClass ? 12 : 6">
    <AppSelect
      v-model="props.selectedProvinceId"
      label="Province"
      placeholder="Select Province"
      :items="provinces"
      :rules="[requiredValidator]"
      clearable
      :disabled="props.mode === 'details'"
      clear-icon="tabler-x"
      @update:model-value="(value) => emit('update:selectedProvinceId', value)"
    />
  </VCol>
  <VCol cols="12" :sm="props.addClass ? 12 : 6">
    <AppSelect
      v-model="props.selectedCityId"
      label="City"
      placeholder="Select City"
      :rules="[requiredValidator]"
      :items="cities"
      :disabled="props.mode === 'details' || !props.selectedProvinceId"
      clearable
      clear-icon="tabler-x"
      @update:model-value="(value) => emit('update:selectedCityId', value)"
    />
  </VCol>
</template>

<style scoped>
/* Add styling if necessary */
</style>
