import { set, get, keys, clear } from 'idb-keyval';
import { PersistenceService, File } from './PersistenceService';

const FILE_PREFIX = 'files.';

export class IndexedDBService implements PersistenceService {

  async getAllFiles(): Promise<File[]> {
    const fileKeys: string[] = (await keys()).map(key => key.toString()).filter(key => key.startsWith(FILE_PREFIX))
    const fileStrings: string[] = await Promise.all(fileKeys.map(key => get(key)));
    console.log('fileStrings', fileStrings);
    return fileStrings.map((fileString: string) => JSON.parse(fileString));
  }

  updateFile(file: File): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async addFile(file: File): Promise<void> {
    console.log('file', file);
    let key = FILE_PREFIX + file.name;
    if ((await keys()).includes(key)) {
      console.warn(`key "${key}" already exists`)
      return
    }
    await set(FILE_PREFIX + file.name, JSON.stringify(file));
  }
}

export function useIndexedDBService(): PersistenceService {
  return useIndexedDBService.service;
}
useIndexedDBService.service = new IndexedDBService();
