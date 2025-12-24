import { createStore, get, set, type UseStore, values } from 'idb-keyval';

const DEFAULT_IDB_NAME = 'xash-idb';
const SAVES_STORE_NAME = 'xash-saves';
const CUSTOM_SAVES_NAME = 'xash-custom-saves';

export interface IDBSaveGame {
  id: string;
  name: string;
  data: Uint8Array;
  lastModified: number; // unix timestamp
}

export interface SavedIdbData<T> {
  gameId: string;
  data: T;
}

export type SaveEntry = SavedIdbData<IDBSaveGame[]>;

export class IdbManager {
  public savesStore: UseStore;

  constructor() {
    this.savesStore = createStore(
      DEFAULT_IDB_NAME,
      SAVES_STORE_NAME,
    );
  }

  // Saves

  public async setSaves(game: string, data: SaveEntry) {
    await set(game, data, this.savesStore);
  }

  public async getAllSaves(): Promise<SaveEntry[]> {
    return await values(this.savesStore);
  }

  public async getCustomSaves(): Promise<SaveEntry | undefined> {
    return await get<SaveEntry>(CUSTOM_SAVES_NAME, this.savesStore);
  }

  public async setCustomSaves(customSaves: SaveEntry): Promise<void> {
    await set(CUSTOM_SAVES_NAME, customSaves, this.savesStore);
  }
}

export default new IdbManager();
