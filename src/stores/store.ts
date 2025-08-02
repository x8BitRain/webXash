import { onMounted, ref } from 'vue';
import { defineStore } from 'pinia';
import { getZip } from '/@/utils/zip-helpers';
import { type Enumify } from '/@/types.ts';
import { Xash3D } from 'xash3d-fwgs';
import { unzipSync } from 'fflate';
import type { FilesWithPath } from '/@/utils/directory-open.ts';

// Xash Imports
// @ts-ignore -- vite url imports
import filesystemURL from 'xash3d-fwgs/filesystem_stdio.wasm?url';
// @ts-ignore -- vite url imports
import xashURL from 'xash3d-fwgs/xash.wasm?url';
// @ts-ignore -- vite url imports
import menuURL from 'xash3d-fwgs/cl_dll/menu_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import HLClientURL from 'hlsdk-portable/cl_dll/client_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import HLServerURL from 'hlsdk-portable/dlls/hl_emscripten_wasm32.so?url';
// @ts-ignore -- vite url imports
import gles3URL from 'xash3d-fwgs/libref_gles3compat.wasm?url';
// @ts-ignore -- vite url imports
import CSMenuURL from 'cs16-client/cl_dll/menu_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import CSClientURL from 'cs16-client/cl_dll/client_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import CSServerURL from 'cs16-client/dlls/cs_emscripten_wasm32.so?url';
import setCanvasLoading from '/@/utils/setCanvasLoading.ts';
import {
  type ConsoleCallback,
  onConsoleMessage,
  SHUTDOWN_MESSAGE,
} from '/@/utils/console-callbacks.ts';
import { delay } from '/@/utils/helpers.ts';

// Constants

const XASH_BASE_DIR = '/rodir/';

const XASH_LIBS = {
  filesystem: filesystemURL,
  xash: xashURL,
  menu: menuURL,
  render: {
    gles3compat: gles3URL,
  },
};

// Perform these callbacks when the matching command is emitted from the xash console
const BASE_GAME_SETTINGS = {
  consoleCallbacks: [
    {
      id: 'onShutdown',
      match: SHUTDOWN_MESSAGE,
      callback: () => window.location.reload(),
    },
  ] as ConsoleCallback[],
};

export const GAME_SETTINGS = {
  HL: {
    name: 'Half-Life',
    launchArgs: [],
    publicDir: 'hl/',
    libraries: {
      ...XASH_LIBS,
      client: HLClientURL,
      server: HLServerURL,
    },
    ...BASE_GAME_SETTINGS,
  },
  CS: {
    name: 'Counter-Strike',
    launchArgs: ['-game', 'cstrike', '+_vgui_menus', '0'],
    publicDir: 'cs/',
    libraries: {
      ...XASH_LIBS,
      menu: CSMenuURL,
      client: CSClientURL,
      server: CSServerURL,
    },
    ...BASE_GAME_SETTINGS,
  },
} as const;

const DEFAULT_ARGS = [`+hud_scale`, '-1.5', '+volume', '0.05'];
const WINDOW_ARGS = ['-windowed', ...DEFAULT_ARGS];
const FULLSCREEN_ARGS = ['-fullscreen', ...DEFAULT_ARGS];
const CONSOLE_ARG = '-console';

export const useXashStore = defineStore(
  'xash',
  () => {
    // State
    const xashCanvas = ref<HTMLCanvasElement>();
    const selectedGame = ref<Enumify<typeof GAME_SETTINGS>>(GAME_SETTINGS.HL);
    const selectedZip = ref('');
    const loading = ref(false);
    const loadingProgress = ref(1);
    const maxLoadingAmount = ref(100);
    const showXashSettingUI = ref(true);
    const launchOptions = ref('');
    const fullScreen = ref(false);
    const enableConsole = ref(true);
    const enableCheats = ref(false);

    // Methods

    const getLaunchArgs = () => {
      const baseArgs = fullScreen.value ? FULLSCREEN_ARGS : WINDOW_ARGS;
      const args = [
        ...selectedGame.value.launchArgs,
        ...baseArgs,
        ...launchOptions.value.split(' ').filter(Boolean),
      ];

      if (enableConsole.value) {
        args.push(CONSOLE_ARG);
      }

      return args;
    };

    const onStartLoading = () => {
      loading.value = true;
      loadingProgress.value = 0;
    };

    const onEndLoading = () => {
      loading.value = false;
      showXashSettingUI.value = false;
    };

    const increaseLoadedAmount = () => {
      loadingProgress.value++;
      if (loadingProgress.value >= maxLoadingAmount.value) {
        onEndLoading();
      }
    };

    const initXash = async () => {
      const launchArguments = getLaunchArgs();
      const xash = new Xash3D({
        module: {
          arguments: launchArguments,
        },
        canvas: xashCanvas.value,
        libraries: selectedGame.value.libraries,
      });
      // Proxy the console output through this function that runs `consoleCallbacks` when xash logs the matching strings.
      onConsoleMessage(selectedGame.value.consoleCallbacks);
      await xash.init();
      return xash;
    };

    // Common file processing logic
    const processFiles = async (filesArray: FilesWithPath[], xash: Xash3D) => {
      if (!filesArray?.length) {
        console.warn('No files selected to start Xash.');
        return;
      }

      onStartLoading();
      maxLoadingAmount.value = filesArray.length;

      xash.em.FS.mkdirTree(XASH_BASE_DIR);

      // Determine the root directory from the selected files so we can strip it from all paths.
      // This ensures the contents of the selected folder are placed directly in XASH_BASE_DIR.
      // e.g., if a file path is "Half-Life/valve/config.cfg", we want to remove "Half-Life/".
      const firstPath = filesArray[0].path;
      const rootDirEndIndex = firstPath.indexOf('/');
      const pathPrefixToRemove =
        rootDirEndIndex !== -1
          ? firstPath.substring(0, rootDirEndIndex + 1)
          : '';

      const allDirs = new Set<string>();

      // Collect directories first
      for (const entry of filesArray) {
        const relativePath = entry.path.substring(pathPrefixToRemove.length);
        if (!relativePath) continue;

        const path = XASH_BASE_DIR + relativePath;
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir) {
          allDirs.add(dir);
        }
      }

      // Create directories
      for (const dir of allDirs) {
        xash.em.FS.mkdirTree(dir);
      }

      // Write files
      for (const entry of filesArray) {
        const relativePath = entry.path.substring(pathPrefixToRemove.length);
        if (!relativePath) {
          increaseLoadedAmount();
          continue;
        }

        const path = XASH_BASE_DIR + relativePath;
        const data = await entry.file.arrayBuffer();
        xash.em.FS.writeFile(path, new Uint8Array(data));
        increaseLoadedAmount();
      }

      xash.em.FS.chdir(XASH_BASE_DIR);
    };

    // Download and unzip logic
    const downloadZip = async (): Promise<ArrayBuffer | undefined> => {
      if (!selectedZip.value) return;
      return await getZip(
        selectedZip.value,
        selectedGame.value.publicDir,
        (progress: number) => (loadingProgress.value = progress),
      );
    };

    const startXashFiles = async (filesArray: FilesWithPath[]) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }
      setCanvasLoading();

      const xash = await initXash();
      await processFiles(filesArray, xash);
      xash.main();
      await onAfterLoad(xash);
    };

    const startXashZip = async (zip?: ArrayBuffer | undefined) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }
      onStartLoading();

      let zipBuffer = zip || undefined;

      if (!zipBuffer) {
        zipBuffer = await downloadZip();
      }

      if (!zipBuffer) {
        console.error('Failed to download the zip file.');
        return;
      }

      const xash = await initXash();
      const zipData = new Uint8Array(zipBuffer);
      const files = unzipSync(zipData);

      xash.em.FS.mkdirTree(XASH_BASE_DIR);

      for (const [filename, content] of Object.entries(files)) {
        const path = XASH_BASE_DIR + filename;
        if (filename.endsWith('/')) {
          xash.em.FS.mkdirTree(path);
        } else {
          const dir = path.substring(0, path.lastIndexOf('/'));
          if (dir) {
            xash.em.FS.mkdirTree(dir);
          }
          xash.em.FS.writeFile(path, content);
        }
      }

      xash.em.FS.chdir(XASH_BASE_DIR);
      xash.main();

      onEndLoading();
      await onAfterLoad(xash);
    };

    const onAfterLoad = async (xash: Xash3D) => {
      await delay(1500); // Wait for xash to fully load first.
      if (enableCheats.value) {
        xash.Cmd_ExecuteString('sv_cheats 1');
      }
    };

    // Hooks

    onMounted(() => {
      // Reapply console callback methods as they do not persist across refreshes.
      selectedGame.value = {
        ...selectedGame.value,
        ...BASE_GAME_SETTINGS
      }
    });

    return {
      xashCanvas,
      selectedGame,
      selectedZip,
      loading,
      loadingProgress,
      maxLoadingAmount,
      showXashSettingUI,
      launchOptions,
      fullScreen,
      enableConsole,
      enableCheats,
      onStartLoading,
      downloadZip,
      startXashZip,
      startXashFiles,
    };
  },
  {
    persist: {
      pick: [
        'selectedGame',
        'selectedZip',
        'launchOptions',
        'fullScreen',
        'enableConsole',
        'enableCheats',
      ],
    },
  },
);
