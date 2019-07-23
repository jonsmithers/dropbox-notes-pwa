import { set, get, del, keys, clear } from 'idb-keyval';
import { PersistenceService, File } from './PersistenceService';

const FILE_PREFIX = 'files.';

export class IndexedDBService implements PersistenceService {

  async getAllFiles(): Promise<File[]> {
    const fileKeys = (await keys()).map(key => key.toString()).filter(key => key.startsWith(FILE_PREFIX))
    return Promise.all(fileKeys.map(key => get(key)));
  }

  updateFile(file: File): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addFile(file: File): Promise<void> {
    return set(FILE_PREFIX + file.name, JSON.stringify(file));
  }
}
