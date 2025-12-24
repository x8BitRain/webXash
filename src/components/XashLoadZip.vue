<template>
  <div class="window no-resize" name="Open ZIP">
    <div class="box">
      <button class="start-button" @click="openZip">Open ZIP</button>
      <input
        ref="zipSelector"
        type="file"
        hidden
        accept=".zip"
        @change="onZipSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import { useXashStore } from "/@/stores/store";

const store = useXashStore();
const zipSelector: Ref<HTMLInputElement | null> = ref(null);
const { startXashZip } = store;

const openZip = async () => {
  zipSelector.value?.click();
};

const onZipSelect = () => {
  const reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) {
      alert("Unable to load zip!");
      return;
    }
    startXashZip?.(reader.result as ArrayBuffer);
  };
  reader.readAsArrayBuffer(zipSelector.value?.files?.[0] as Blob);
};
</script>

<style scoped lang="scss">
.start-button {
  text-align: center;
  width: 100%;
}
</style>
