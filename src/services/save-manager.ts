import { type Xash3D } from 'xash3d-fwgs';
import { type Enumify } from '/@/types.ts';
import { type GAME_SETTINGS, useXashStore } from '/@/stores/store.ts';
import {
  type IDBSaveGame,
  type SavedIdbData,
  type SaveEntry,
} from '/@/services/idb-manager.ts';
import { IdbManager } from '/@/services/index.ts';

const RODIR = '/rodir/';
export const SAVE_DIR = 'valve/save/';
const CUSTOM_SAVE_NAME = 'Custom Saves';

class SaveManager {
  private _xash: Xash3D | null = null;

  private get FS() {
    return this._xash?.em.FS;
  }

  private _buildSaveLocation(saveName: string) {
    const store = useXashStore();
    const saveLocation = (RODIR + store.customGameArg + '/' + saveName).replace(
      '//',
      '/',
    );
    console.info('Writing save: ' + saveLocation);
    return saveLocation;
  }

  private _ensureSaveFolderExists() {
    const saveLocation = this._buildSaveLocation('');
    try {
      this.FS.readdir(saveLocation)
    } catch (error) {
      // @ts-ignore -- errno 44 usually means the folder doesn't exist.
      if (error && error.errno && error.errno === 44) {
        this.FS.mkdir(saveLocation);
      }
    }
  }

  public init(xash: Xash3D): void {
    this._xash = xash;
  }

  public async onSave(selectedGame: Enumify<typeof GAME_SETTINGS>) {
    if (!this._xash) {
      console.warn('Xash not setup yet');
      return;
    }

    let existingCategory: SaveEntry | undefined = undefined;
    const rawSaves = this.FS.readdir(RODIR + SAVE_DIR);
    const existingSaves = await IdbManager.getAllSaves();

    const saveFileNames = rawSaves.filter((fileName: string) =>
      fileName.endsWith('.sav'),
    ) as string[];

    if (existingSaves && existingSaves.length > 0) {
      existingCategory = existingSaves.find(
        (existingSave) => existingSave.gameId === selectedGame.name,
      );
    }

    if (existingCategory) {
      for (const fileName of saveFileNames) {
        const saveData = this.FS.readFile(
          this._buildSaveLocation(fileName),
        ) as Uint8Array;
        existingCategory.data.push({
          id: crypto.randomUUID(),
          name: fileName,
          data: saveData,
          lastModified: Date.now(),
        });
      }
      await IdbManager.setSaves(selectedGame.name, existingCategory);
      return;
    } else {
      const save: SavedIdbData<IDBSaveGame[]> = {
        gameId: selectedGame.name,
        data: [],
      };

      for (const fileName of saveFileNames) {
        const saveData = this.FS.readFile(
          this._buildSaveLocation(fileName),
        ) as Uint8Array;
        save.data.push({
          id: crypto.randomUUID(),
          name: fileName,
          data: saveData,
          lastModified: Date.now(),
        });
      }

      await IdbManager.setSaves(selectedGame.name, save);
    }
  }

  public async listSaves(): Promise<SaveEntry[]> {
    return await IdbManager.getAllSaves();
  }

  public async addCustomSaves(saves: File[]): Promise<void> {
    const existingCustomSaves = await IdbManager.getCustomSaves();
    // Append to custom saves if exists
    if (existingCustomSaves && existingCustomSaves.gameId) {
      for (const save of saves) {
        const saveArrayBuffer = await save.arrayBuffer();
        const saveUint8Array = new Uint8Array(saveArrayBuffer);
        existingCustomSaves.data.push({
          id: crypto.randomUUID(),
          name: save.name,
          data: saveUint8Array,
          lastModified: Date.now(),
        });
      }
      await IdbManager.setCustomSaves(existingCustomSaves);
      return;
    } else {
      // Otherwise, create a new entry
      const newCustomSave: SavedIdbData<IDBSaveGame[]> = {
        gameId: CUSTOM_SAVE_NAME,
        data: [],
      };
      for (const save of saves) {
        const saveArrayBuffer = await save.arrayBuffer();
        const saveUint8Array = new Uint8Array(saveArrayBuffer);
        newCustomSave.data.push({
          id: crypto.randomUUID(),
          name: save.name,
          data: saveUint8Array,
          lastModified: Date.now(),
        });
      }
      await IdbManager.setCustomSaves(newCustomSave);
    }
  }

  public async removeCustomSave(save: IDBSaveGame): Promise<void> {
    const existingCustomSaves = await IdbManager.getCustomSaves();
    if (existingCustomSaves && existingCustomSaves.gameId) {
      const index = existingCustomSaves.data.findIndex(
        (existingSave) => existingSave.lastModified === save.lastModified,
      );
      if (index > -1) {
        existingCustomSaves.data.splice(index, 1);
        await IdbManager.setCustomSaves(existingCustomSaves);
      }
    }
  }

  public async transferSavesToGame() {
    const allSaves = await IdbManager.getAllSaves();
    const flattenedSaves = allSaves.flatMap((save) => save.data);
    this._ensureSaveFolderExists();
    for (const save of flattenedSaves) {
      if (save && save.name && save.data) {
        this.FS.writeFile(this._buildSaveLocation(save.name), save.data);
      }
    }
  }
}

export default new SaveManager();
