<template>
  <div class="window no-resize" name="Half-Life Demos">
    <div class="box inset">
      <p
        v-for="zip in zipList"
        :key="zip.name"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedZip === zip.packageName }"
        @click="selectedZip = zip.packageName"
      >
        {{ zip.name }}
      </p>
    </div>
    <label
      v-if="selectedZipConfig?.bots !== undefined"
      class="bot-count"
      for="bot-count"
    >
      Bots
      <input
        id="bot-count"
        v-model.number="bots"
        type="number"
        min="0"
        max="16"
      />
    </label>
    <p v-if="selectedZipConfig?.bots !== undefined" class="hint">
      Bots turn the server into a multiplayer game, and the engine refuses to
      save in a multiplayer game. Set this to 0 to be able to save.
    </p>
    <label class="volume" for="volume">
      Volume
      <input
        id="volume"
        v-model.number="volumePercent"
        type="number"
        min="0"
        max="100"
        step="5"
      />
    </label>
    <button class="start-button" :disabled="!selectedZip" @click="start">
      Start Demo
    </button>
  </div>
</template>

<script setup lang="ts">
  import zipList from '/@/config/games';
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';
  import setCanvasLoading from '/@/utils/setCanvasLoading.ts';
  import { XashLoader } from '/@/services';

  const store = useXashStore();

  const {
    selectedZip,
    selectedGame,
    xashCanvas,
    launchOptions,
    selectedLocalFolder,
    fullScreen,
    enableConsole,
    enableCheats,
    botCount,
    volume,
    loadingProgress,
    customGameArg,
  } = storeToRefs(store);
  const { onStartLoading, onEndLoading, refreshSavesList } = store;

  // Methods

  const selectedZipConfig = computed(() =>
    zipList.find((zip) => zip.packageName === selectedZip.value),
  );

  // Bots are only added to demos that support them, and the amount the
  // player asked for is used for those.
  const bots = computed({
    get: () => botCount.value,
    set: (value: number | string) => {
      const count = Number(value);
      botCount.value = Number.isFinite(count)
        ? Math.min(16, Math.max(0, Math.trunc(count)))
        : 0;
    },
  });

  const demoBots = computed(() =>
    selectedZipConfig.value?.bots !== undefined ? bots.value : 0,
  );

  // The engine wants a volume between 0 and 1, the user thinks in percent.
  const volumePercent = computed({
    get: () => Math.round(volume.value * 100),
    set: (value: number | string) => {
      const percent = Number(value);
      volume.value = Number.isFinite(percent)
        ? Math.min(100, Math.max(0, Math.trunc(percent))) / 100
        : 0;
    },
  });

  const start = async () => {
    if (!xashCanvas.value) {
      console.error('Canvas is not available');
      return;
    }

    setCanvasLoading();
    const zip = await XashLoader.downloadZip(
      selectedZip.value,
      selectedGame.value.publicDir,
      (progress: number) => (loadingProgress.value = progress),
    );
    if (!zip) {
      alert('Selected game could not be loaded!');
      return;
    }

    try {
      const xash = await XashLoader.startGameZip(zip, {
        canvas: xashCanvas.value,
        selectedGame: selectedGame.value,
        selectedZip: selectedZip.value,
        selectedLocalFolder: selectedLocalFolder.value,
        launchOptions: launchOptions.value,
        startMap: selectedZipConfig.value?.map,
        bots: demoBots.value,
        volume: volume.value,
        fullScreen: fullScreen.value,
        enableConsole: enableConsole.value,
        enableCheats: enableCheats.value,
        onStartLoading,
        onEndLoading,
        onProgress: (progress) => {
          if (typeof progress === 'number') {
            loadingProgress.value = progress;
          } else {
            loadingProgress.value = progress.current;
          }
        },
      });

      await XashLoader.onAfterLoad({
        xash,
        selectedGame: selectedGame.value,
        customGameArg: customGameArg.value,
        enableCheats: enableCheats.value,
        bots: demoBots.value,
      });

      await XashLoader.initConsoleCallbacks(
        xash,
        selectedGame.value.consoleCallbacks,
      );

      await refreshSavesList();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };
</script>

<style scoped lang="scss">
  .bot-count,
  .volume {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.5rem;

    input {
      width: 5rem;
      text-align: center;
    }
  }

  .hint {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    line-height: 1.2;
    opacity: 0.7;
  }

  .start-button {
    margin-top: 0.5rem;
    text-align: center;
    width: 100%;
  }
</style>
