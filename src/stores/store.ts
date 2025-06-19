import { ref } from 'vue';
import { defineStore } from 'pinia';
import getZip from '/@/utils/getZip';
import type { FilesWithPath } from '/@/utils/directoryOpen.ts';
import { type Enumify } from '/@/types.ts';

// Types

interface WasmInit {
  startWithFiles: (
    files: FilesWithPath[],
    args: string[],
    increaseLoadedAmount: () => void,
  ) => void;
  start: (
    zip: ArrayBuffer,
    args: string[],
    increaseLoadedAmount: () => void,
  ) => void;
}

// Data

export const GAME_SETTINGS = {
  HL: {
    name: 'Half-Life',
    launchArgs: [],
    publicDir: 'hl/',
  },
  CS: {
    name: 'Counter-Strike',
    launchArgs: ['-game', 'cstrike', '+_vgui_menus', '0'],
    publicDir: 'cs/',
  },
} as const;

const DEFAULT_ARGS = [`+hud_scale`, `5.5`, '+volume', '0.5'];

const WINDOW_ARGS = ['-windowed', ...DEFAULT_ARGS];

const FULLSCREEN_ARGS = ['-fullscreen', ...DEFAULT_ARGS];

const CONSOLE_ARG = '-console';

export const useXashStore = defineStore('xash', () => {
  const selectedGame = ref<Enumify<typeof GAME_SETTINGS>>(GAME_SETTINGS.HL);
  const selectedZip = ref('');
  const loading = ref(false);
  const loadingProgress = ref(1);
  const maxLoadingAmount = ref(100);
  const showXashSettingUI = ref(true);
  const launchOptions = ref('');
  const fullScreen = ref(false);
  const enableConsole = ref(true);

  const downloadZip = async (): Promise<ArrayBuffer | undefined> => {
    if (!selectedZip.value) return;
    loadingProgress.value = 0;
    loading.value = true;
    return await getZip(
      selectedZip.value,
      selectedGame.value.publicDir,
      (progress: number) => (loadingProgress.value = progress),
    );
  };

  const getLaunchArgs = () => {
    const launchArgs = fullScreen.value ? FULLSCREEN_ARGS : WINDOW_ARGS;
    const args = [
      ...selectedGame.value.launchArgs,
      ...launchArgs,
      ...launchOptions.value.split(' '),
    ];
    if (enableConsole.value) {
      args.push(CONSOLE_ARG);
    }
    return args;
  };

  const increaseLoadedAmount = () => {
    loadingProgress.value++;
    if (loadingProgress.value >= maxLoadingAmount.value) {
      onEndLoading();
    }
  };

  const onStartLoading = () => {
    loading.value = true;
  };

  const onEndLoading = () => {
    loading.value = false;
    showXashSettingUI.value = false;
  };

  const startXashZip = async (zip: ArrayBuffer) => {
    const { start } = (await import(
      // @ts-ignore -- unresolved dir
      '/@/utils/wasmInit'
    )) as WasmInit;
    const args = getLaunchArgs();
    start(zip, args, increaseLoadedAmount);
  };

  const startXashFiles = async (files: FilesWithPath[]) => {
    onStartLoading();
    maxLoadingAmount.value = files.length;
    const { startWithFiles } = (await import(
      // @ts-ignore -- unresolved dir
      '/@/utils/wasmInit'
    )) as WasmInit;
    const args = getLaunchArgs();
    startWithFiles(files, args, increaseLoadedAmount);
  };

  return {
    selectedGame,
    selectedZip,
    loading,
    loadingProgress,
    maxLoadingAmount,
    showXashSettingUI,
    launchOptions,
    fullScreen,
    enableConsole,
    onStartLoading,
    downloadZip,
    startXashZip,
    startXashFiles,
  };
});
