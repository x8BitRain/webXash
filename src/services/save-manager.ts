import { createStore, get, set, values, type UseStore } from 'idb-keyval';
import type { Xash3D } from 'xash3d-fwgs';
import { useXashStore } from '/@/stores/store.ts';

// Constants
const DEFAULT_IDB_NAME = 'xash-idb';
const SAVES_STORE_NAME = 'xash-saves';
const CUSTOM_SAVES_NAME = 'xash-custom-saves';
const RODIR = '/rodir/';
export const DEFAULT_GAME_DIR = 'valve/';

// Types
export interface IDBSaveGame {
  id: string;
  name: string;
  data: Uint8Array;
  lastModified: number;
}

export interface SavedIdbData<T> {
  gameId: string;
  data: T;
}

export type SaveEntry = SavedIdbData<IDBSaveGame[]>;

class SaveManager {
  private _xash: Xash3D | null = null;
  private readonly _savesStore: UseStore;

  constructor() {
    this._savesStore = createStore(DEFAULT_IDB_NAME, SAVES_STORE_NAME);
  }

  private get FS() {
    return this._xash?.em.FS;
  }

  private _buildSaveLocation(saveName: string = ''): string {
    const store = useXashStore();
    const saveLocation = (
      RODIR +
      store.customGameArg +
      '/save/' +
      saveName
    ).replace('//', '/');
    console.info('Writing save: ' + saveLocation);
    return saveLocation;
  }

  private _ensureSaveFolderExists(): void {
    if (!this.FS) return;

    const saveLocation = this._buildSaveLocation();
    try {
      this.FS.readdir(saveLocation);
    } catch (error) {
      // @ts-ignore -- errno 44 usually means the folder doesn't exist.
      if (error?.errno === 44) {
        this.FS.mkdir(saveLocation);
      }
    }
  }

  private async _getSaveEntry(gameId: string): Promise<SaveEntry | undefined> {
    return await get<SaveEntry>(gameId, this._savesStore);
  }

  private async _setSaveEntry(gameId: string, data: SaveEntry): Promise<void> {
    await set(gameId, data, this._savesStore);
  }

  private _readSaveFiles(): string[] {
    if (!this.FS) return [];

    const rawSaves = this.FS.readdir(this._buildSaveLocation());
    return rawSaves.filter((fileName: string) =>
      fileName.endsWith('.sav'),
    ) as string[];
  }

  private _createSaveGame(fileName: string): IDBSaveGame | null {
    if (!this.FS) return null;

    const saveData = this.FS.readFile(
      this._buildSaveLocation(fileName),
    ) as Uint8Array;

    return {
      id: crypto.randomUUID(),
      name: fileName,
      data: saveData,
      lastModified: Date.now(),
    };
  }

  private _upsertSave(
    saves: IDBSaveGame[],
    newSave: IDBSaveGame,
  ): IDBSaveGame[] {
    const existingIndex = saves.findIndex((save) => save.name === newSave.name);

    if (existingIndex > -1) {
      // Update existing save with new data but keep the same id
      saves[existingIndex] = {
        ...saves[existingIndex],
        data: newSave.data,
        lastModified: Date.now(),
      };
    } else {
      saves.push(newSave);
    }

    return saves;
  }

  public init(xash: Xash3D): void {
    this._xash = xash;
  }

  public async onSave(): Promise<void> {
    const store = useXashStore();

    if (!this._xash) {
      console.warn('Xash not setup yet');
      return;
    }

    console.info(this.FS);

    let gameId: string;
    if (store.customGameArg === DEFAULT_GAME_DIR) {
      gameId = store.selectedGame.name;
    } else {
      gameId = store.customGameArg;
    }

    const saveFileNames = this._readSaveFiles();
    console.log(saveFileNames);
    if (saveFileNames.length === 0) return;

    const existingEntry = await this._getSaveEntry(gameId);
    let saves: IDBSaveGame[] = existingEntry?.data ?? [];

    for (const fileName of saveFileNames) {
      const saveGame = this._createSaveGame(fileName);
      if (saveGame) {
        saves = this._upsertSave(saves, saveGame);
      }
    }

    await this._setSaveEntry(gameId, {
      gameId,
      data: saves,
    });
  }

  public async listSaves(): Promise<SaveEntry[]> {
    return await values<SaveEntry>(this._savesStore);
  }

  public async getSaveById(saveId: string): Promise<IDBSaveGame | null> {
    const allSaves = await this.listSaves();

    for (const saveEntry of allSaves) {
      const foundSave = saveEntry.data.find((save) => save.id === saveId);
      if (foundSave) {
        return foundSave;
      }
    }

    return null;
  }

  public async addCustomSaves(saves: File[]): Promise<void> {
    const existingCustomSaves = await get<SaveEntry>(
      CUSTOM_SAVES_NAME,
      this._savesStore,
    );

    let customSaves: IDBSaveGame[] = existingCustomSaves?.data ?? [];

    for (const save of saves) {
      const saveArrayBuffer = await save.arrayBuffer();
      const newSave: IDBSaveGame = {
        id: crypto.randomUUID(),
        name: save.name,
        data: new Uint8Array(saveArrayBuffer),
        lastModified: Date.now(),
      };
      customSaves = this._upsertSave(customSaves, newSave);
    }

    await set(
      CUSTOM_SAVES_NAME,
      {
        gameId: CUSTOM_SAVES_NAME,
        data: customSaves,
      },
      this._savesStore,
    );
  }

  public async removeSave(save: IDBSaveGame): Promise<void> {
    const allSaves = await this.listSaves();

    for (const saveEntry of allSaves) {
      const index = saveEntry.data.findIndex(
        (existingSave) => existingSave.id === save.id,
      );

      if (index > -1) {
        saveEntry.data.splice(index, 1);
        await set(saveEntry.gameId, saveEntry, this._savesStore);
        console.info(`Removed save "${save.name}" from ${saveEntry.gameId}`);
        return;
      }
    }

    console.warn(`Save with id ${save.id} not found in any category`);
  }

  public async transferSavesToGame(gameId: string): Promise<void> {
    if (!this.FS) return;

    const allSaves = await this.listSaves();
    const matchingSaveEntry = allSaves.find((save) => save.gameId === gameId);
    const customSaves = allSaves.find(
      (save) => save.gameId === CUSTOM_SAVES_NAME,
    ) ?? { data: [] };

    if (!matchingSaveEntry) {
      console.info(`No saves found for game: ${gameId}`);
      return;
    }

    this._ensureSaveFolderExists();

    for (const save of [...matchingSaveEntry.data, ...customSaves.data]) {
      if (save?.name && save?.data) {
        this.FS.writeFile(this._buildSaveLocation(save.name), save.data);
      }
    }
  }
}

export default new SaveManager();
