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
import { storeToRefs } from "pinia";
import { XashLoader } from "/@/services";

const store = useXashStore();
const zipSelector: Ref<HTMLInputElement | null> = ref(null);

const {
  selectedGame,
  xashCanvas,
  selectedZip,
  launchOptions,
  selectedLocalFolder,
  fullScreen,
  enableConsole,
  enableCheats,
  loadingProgress,
  customGameArg,
} = storeToRefs(store);
const { onStartLoading, onEndLoading, refreshSavesList } = store;

const openZip = async () => {
  zipSelector.value?.click();
};

const onZipSelect = async () => {
  const reader = new FileReader();
  reader.onload = async () => {
    if (!reader.result) {
      alert("Unable to load zip!");
      return;
    }

    if (!xashCanvas.value) {
      console.error("Canvas is not available");
      return;
    }

    try {
      const xash = await XashLoader.startGameZip(
        reader.result as ArrayBuffer,
        {
          canvas: xashCanvas.value,
          selectedGame: selectedGame.value,
          selectedZip: selectedZip.value,
          selectedLocalFolder: selectedLocalFolder.value,
          launchOptions: launchOptions.value,
          fullScreen: fullScreen.value,
          enableConsole: enableConsole.value,
          enableCheats: enableCheats.value,
          onStartLoading,
          onEndLoading,
          onProgress: (progress) => {
            if (typeof progress === "number") {
              loadingProgress.value = progress;
            } else {
              loadingProgress.value = progress.current;
            }
          },
        }
      );

      await XashLoader.onAfterLoad({
        xash,
        selectedGame: selectedGame.value,
        customGameArg: customGameArg.value,
        enableCheats: enableCheats.value,
      });

      await XashLoader.initConsoleCallbacks(
        xash,
        selectedGame.value.consoleCallbacks
      );

      await refreshSavesList();
    } catch (error) {
      console.error("Failed to start game:", error);
    }
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
