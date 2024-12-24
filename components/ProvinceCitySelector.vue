<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import {
  minLengthValidator,
  numberValidator,
  phoneValidator,
  requiredValidator,
} from '@/utils/validators'

const props = defineProps({
  selectedProvinceId: Number,
  selectedCityId: Number,
  addClass: Boolean ,
})

const emit = defineEmits(['update:selectedProvinceId', 'update:selectedCityId'])

const provinces = ref([])
const cities = ref([])
const snackBarStore = useSnackbarStore()
const apiRequestObj = useApi()

const fetchProvinces = async () => {
  try {
    const response = await apiRequestObj.makeRequest('common/provinces', 'get')

    provinces.value = response.data.map(province => ({
      value: province.id,
      title: province.name,
    }))
    if (provinces.value.length > 0 && props.selectedProvinceId !== undefined)
      emit('update:selectedProvinceId', provinces.value[0]?.value) // Set default province
  }
  catch (error) {
    snackBarStore.showSnackbar('Failed to load provinces', 'error')
  }
}

const fetchCities = async (provinceId: number) => {
  try {
    const response = await apiRequestObj.makeRequest(`common/cities/${provinceId}`, 'get')

    cities.value = response.data.map(city => ({
      value: city.id,
      title: city.name,
    }))
  }
  catch (error) {
    snackBarStore.showSnackbar('Failed to load cities', 'error')
  }
}

// Watch province selection and load cities
watch(() => props.selectedProvinceId, newProvinceId => {
  if (newProvinceId)
    fetchCities(newProvinceId)
}, { immediate: true })

// Fetch provinces on mount
onMounted(() => {
  console.log(props.selectedProvinceId)
  console.log(props.selectedCityId)
  fetchProvinces()
})
</script>

<template>

  <VCol
    cols="12"
    :sm="props.addClass ? 12 : 6"
  >
    <AppSelect
      v-model="props.selectedProvinceId"
      label="Province"
      placeholder="Select Province"
      :items="provinces"
      :rules="[requiredValidator]"
      clearable
      clear-icon="tabler-x"
      @update:model-value="(value) => emit('update:selectedProvinceId', value)"
    />
  </VCol>
  <VCol
    cols="12"
    :sm="props.addClass ? 12 : 6"
  >
    <AppSelect
      v-model="props.selectedCityId"
      label="City"
      placeholder="Select City"
      :disabled="!props.selectedProvinceId"
      :items="cities"
      clearable
      clear-icon="tabler-x"
      @update:model-value="(value) => emit('update:selectedCityId', value)"
    />
  </VCol>
</template>

<style scoped>
/* Add styling if necessary */
</style>
