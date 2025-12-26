import { computed, onMounted, ref } from 'vue';
import { SaveManager } from '/@/services';
import { defineStore } from 'pinia';
import type { Enumify } from '/@/types.ts';
import { type SaveEntry } from '/@/services/save-manager.ts';
import { DEFAULT_GAME_DIR } from '/@/services/save-manager.ts';
import { BASE_GAME_SETTINGS, GAME_SETTINGS } from '/@/services/xash-loader.ts';

export const useXashStore = defineStore(
  'xash',
  () => {
    // State
    const xashCanvas = ref<HTMLCanvasElement>();
    const selectedGame = ref<Enumify<typeof GAME_SETTINGS>>(GAME_SETTINGS.HL);
    const selectedZip = ref('');
    const selectedLocalFolder = ref('');
    const saves = ref<Partial<SaveEntry>[]>();
    const loading = ref(false);
    const loadingProgress = ref(1);
    const maxLoadingAmount = ref(100);
    const showXashSettingUI = ref(true);
    // -- Launch options
    const launchOptions = ref('');
    const fullScreen = ref(false);
    const enableConsole = ref(true);
    const enableCheats = ref(false);

    // Methods

    const onStartLoading = () => {
      loading.value = true;
      loadingProgress.value = 0;
    };

    const onEndLoading = () => {
      loading.value = false;
      showXashSettingUI.value = false;
    };

    const refreshSavesList = async () => {
      const saveEntries = await SaveManager.listSaves();

      // Throw away the game data for now just to save on memory.
      for (const file of saveEntries) {
        if (file.data) {
          for (const saveData of file.data) {
            saveData.data = new Uint8Array();
          }
        }
      }

      saves.value = saveEntries;
    };

    // Computed

    const customGameArg = computed((): string => {
      // This regex should return two groups if it detects:
      // Group 0 (full match): -game blueshift
      // Group 1: blueshift (the word after -game)
      const customGameSearch = launchOptions.value?.match(
        /-game\s+(\S+)(?!.*-game\s+\S+)/,
      );
      if (customGameSearch && customGameSearch.length === 2) {
        return customGameSearch[1];
      } else if (selectedLocalFolder.value) {
        return selectedLocalFolder.value;
      } else {
        return DEFAULT_GAME_DIR;
      }
    });

    // Hooks

    onMounted(async () => {
      // Reapply console callback methods as they do not persist across refreshes.
      selectedGame.value = {
        ...selectedGame.value,
        ...BASE_GAME_SETTINGS,
      };

      // Getting Save Data from IDB
      await refreshSavesList();
    });

    return {
      // Data
      xashCanvas,
      selectedGame,
      selectedZip,
      selectedLocalFolder,
      saves,
      loading,
      loadingProgress,
      maxLoadingAmount,
      showXashSettingUI,
      launchOptions,
      fullScreen,
      enableConsole,
      enableCheats,
      // Computed
      customGameArg,
      // Methods
      onStartLoading,
      onEndLoading,
      refreshSavesList,
    };
  },
  {
    persist: {
      pick: [
        'selectedGame',
        'selectedZip',
        'selectedLocalFolder',
        'launchOptions',
        'fullScreen',
        'enableConsole',
        'enableCheats',
      ],
    },
  },
);
