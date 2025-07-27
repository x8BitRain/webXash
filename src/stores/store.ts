import { ref } from 'vue';
import { defineStore } from 'pinia';
import getZip from '/@/utils/getZip';
import { type Enumify } from '/@/types.ts';
import { Xash3D } from 'xash3d-fwgs';
import { unzipSync } from 'fflate';
import type { FilesWithPath } from '/@/utils/directoryOpen.ts';
// Xash Imports
import filesystemURL from 'xash3d-fwgs/filesystem_stdio.wasm?url';
import xashURL from 'xash3d-fwgs/xash.wasm?url';
import menuURL from 'xash3d-fwgs/cl_dll/menu_emscripten_wasm32.wasm?url';
import HLClientURL from 'hlsdk-portable/cl_dll/client_emscripten_wasm32.wasm?url';
import HLServerURL from 'hlsdk-portable/dlls/hl_emscripten_wasm32.so?url';
import gles3URL from 'xash3d-fwgs/libref_gles3compat.wasm?url';
import CSMenuURL from 'cs16-client/cl_dll/menu_emscripten_wasm32.wasm?url';
import CSClientURL from 'cs16-client/cl_dll/client_emscripten_wasm32.wasm?url';
import CSServerURL from 'cs16-client/dlls/cs_emscripten_wasm32.so?url';

// Data

const XASH_LIBS = {
  filesystem: filesystemURL,
  xash: xashURL,
  menu: menuURL,
  render: {
    gles3compat: gles3URL,
  },
};

const XASH_BASE_DIR = '/rodir/';

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
  },
} as const;

const DEFAULT_ARGS = [`+hud_scale`, '-1.5', '+volume', '0.05'];

const WINDOW_ARGS = ['-windowed', ...DEFAULT_ARGS];

const FULLSCREEN_ARGS = ['-fullscreen', ...DEFAULT_ARGS];

const CONSOLE_ARG = '-console';

export const useXashStore = defineStore('xash', () => {
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
      ...launchOptions.value.split(' ').filter(Boolean), // Use filter(Boolean) to remove empty strings
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
    loadingProgress.value = 0;
  };

  const onEndLoading = () => {
    loading.value = false;
    showXashSettingUI.value = false;
  };

  const initXash = async () => {
    const args = getLaunchArgs();
    const xash = new Xash3D({
      args,
      canvas: xashCanvas.value,
      libraries: selectedGame.value.libraries,
      onRuntimeInitialized: function () {},
    });

    await xash.init();
    return xash;
  };

  const startXashFiles = async (filesArray: FilesWithPath[]) => {
    if (!xashCanvas.value) {
      console.error('Xash canvas is not available.');
      return;
    }
    if (!filesArray?.length) {
      console.warn('No files selected to start Xash.');
      return;
    }

    onStartLoading();
    maxLoadingAmount.value = filesArray.length;

    const xash = await initXash();

    xash.em.FS.mkdirTree(XASH_BASE_DIR);

    // Determine the root directory from the selected files so we can strip it from all paths.
    // This ensures the contents of the selected folder are placed directly in XASH_BASE_DIR.
    // e.g., if a file path is "Half-Life/valve/config.cfg", we want to remove "Half-Life/".
    const firstPath = filesArray[0].path;
    const rootDirEndIndex = firstPath.indexOf('/');
    const pathPrefixToRemove =
      rootDirEndIndex !== -1 ? firstPath.substring(0, rootDirEndIndex + 1) : '';

    const allDirs = new Set<string>();
    for (const entry of filesArray) {
      const relativePath = entry.path.substring(pathPrefixToRemove.length);
      if (!relativePath) continue; // Skip the root directory itself.

      const path = XASH_BASE_DIR + relativePath;
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (dir) {
        allDirs.add(dir);
      }
    }

    for (const dir of allDirs) {
      xash.em.FS.mkdirTree(dir);
    }

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
    xash.main();
    onEndLoading();
  };

  const startXashZip = async () => {
    if (!xashCanvas.value) {
      console.error('Xash canvas is not available.');
      return;
    }

    onStartLoading();

    const zipBuffer = await downloadZip();

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

    console.log(xash.em.FS);
    xash.em.FS.chdir(XASH_BASE_DIR);
    xash.main();

    onEndLoading();

    // if (import.meta.env.DEV) {
      xash.Cmd_ExecuteString('sv_cheats 1')
      xash.Cmd_ExecuteString('map c1a0')
      xash.Cmd_ExecuteString('impulse 101')
    // }
  };

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
    onStartLoading,
    downloadZip,
    startXashZip,
    startXashFiles,
  };
});
