<template>
  <div class="container">
    <div class="d-flex justify-center">
      <div class="mx-auto mt-4 text-center">
        <!-- QR Code Display -->
        <div class="d-flex justify-center">
          <qrcode-vue :value="url" :size="size" level="H" />
        </div>

        <!-- Action Buttons -->
        <div class="d-flex align-center justify-center mt-4">
          <!-- Download Button -->
          <VBtn color="primary" @click="downloadImage" class="mr-3">
            Download QR Code
          </VBtn>

          <!-- Copy URL Button -->
          <IconBtn @click="copyUrl" class="mr-3">
            <VIcon icon="tabler-copy" />
          </IconBtn>
        </div>

        <!-- Copy Success Message -->
        <div
          v-if="showCopiedMessage"
          class="mt-2 text-green-darken-2 text-caption"
        >
          URL copied to clipboard!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";
import QRCode from "qrcode";

export default {
  name: "QrcodeComponent",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showCopiedMessage: false,
      size: 150, // QR code size
    };
  },
  components: {
    QrcodeVue,
  },
  methods: {
    // Copy URL to Clipboard
    async copyUrl() {
      try {
        await navigator.clipboard.writeText(this.url);
        this.showCopiedMessage = true;
        setTimeout(() => (this.showCopiedMessage = false), 1500);
      } catch (error) {
        console.error("Failed to copy URL: ", error);
      }
    },

    // Generate and Download QR Code Image
    downloadImage() {
      const qrCodeCanvas = document.createElement("canvas");
      QRCode.toCanvas(qrCodeCanvas, this.url, (error) => {
        if (error) {
          console.error("Error generating QR Code: ", error);
        } else {
          this.triggerDownload(qrCodeCanvas);
        }
      });
    },

    // Trigger File Download
    triggerDownload(canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).slice(2, 8);
      link.download = `qr_code_${timestamp}_${randomString}.png`;
      link.click();
    },
  },
};
</script>

<style scoped>
.text-caption {
  font-size: 0.9rem;
}
</style>
