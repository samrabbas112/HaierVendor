<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'

// Define props
const props = defineProps({
  event: {
    type: String,
    required: false,
    default: 'success'
  }
})

const svgColor = ref('')

// Function to update the color based on the event
const updateColor = (event: string) => {
  svgColor.value = event === 'decline' ? '#E84040' : '#1dbf73'; // Red or green
};

// Watch for changes in the `event` prop to update the color
watch(() => props.event, (newEvent) => {
  updateColor(newEvent);
});

// Initialize color on component mount
onMounted(() => {
  updateColor(props.event);
});
</script>

<template>
    <svg width="328" height="247" viewBox="0 0 328 247" :fill="svgColor" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_14007_2363)">
            <circle cx="164" cy="150" r="42" fill="white" />
            <circle cx="164" cy="150" r="40.5" stroke="white" stroke-width="3" />
        </g>
        <circle cx="164.5" cy="150" r="37" :fill="svgColor" />
        <path d="M152.7 148.883L160.473 156.656L176.019 140" stroke="white" stroke-width="3.33125" stroke-linecap="round"
            stroke-linejoin="round" />
        <circle cx="8.42991" cy="111.121" r="8.42991" :fill="svgColor" />
        <circle cx="63.6079" cy="63.6086" r="5.36449" :fill="svgColor" />
        <circle cx="45.2153" cy="142.544" r="3.06542" :fill="svgColor" />
        <circle cx="52.1121" cy="183.927" r="3.06542" :fill="svgColor" />
        <circle cx="82.7666" cy="202.317" r="3.06542" :fill="svgColor" />
        <circle cx="124.149" cy="243.7" r="3.06542" :fill="svgColor" />
        <circle cx="44.4482" cy="242.168" r="4.59813" :fill="svgColor" />
        <circle cx="36.0188" cy="20.6931" r="3.83178" :fill="svgColor" />
        <circle cx="95.7949" cy="49.8142" r="3.83178" :fill="svgColor" />
        <circle cx="189.289" cy="63.6077" r="2.29907" :fill="svgColor" />
        <circle cx="241.402" cy="89.6643" r="2.29907" :fill="svgColor" />
        <circle cx="258.262" cy="68.2073" r="2.29907" :fill="svgColor" />
        <circle cx="265.925" cy="39.0862" r="2.29907" :fill="svgColor" />
        <circle cx="305.775" cy="100.391" r="2.29907" :fill="svgColor" />
        <circle cx="279.72" cy="180.094" r="2.29907" :fill="svgColor" />
        <circle cx="307.309" cy="115.721" r="2.29907" :fill="svgColor" />
        <circle cx="126.448" cy="63.6052" r="3.83178" :fill="svgColor" />
        <circle cx="164.767" cy="5.36449" r="5.36449" :fill="svgColor" />
        <circle cx="190.822" cy="21.4595" r="4.59813" :fill="svgColor" />
        <circle cx="174.729" cy="45.9809" r="4.59813" :fill="svgColor" />
        <circle cx="272.822" cy="145.608" r="4.59813" :fill="svgColor" />
        <circle cx="248.299" cy="194.655" r="4.59813" :fill="svgColor" />
        <circle cx="231.439" cy="230.674" r="2.29907" :fill="svgColor" />
        <circle cx="268.99" cy="204.619" r="3.83178" :fill="svgColor" />
        <circle cx="320.336" cy="216.111" r="7.66355" :fill="svgColor" />
        <defs>
            <filter id="filter0_d_14007_2363" x="93.4" y="83.4" width="141.2" height="141.2" filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="14.3" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14007_2363" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_14007_2363" result="shape" />
            </filter>
        </defs>
    </svg>
</template>
