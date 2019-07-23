import { PersistenceService, File } from './PersistenceService';
import { Dropbox, files as filesTypes } from 'dropbox'

export class DropboxService implements PersistenceService {
  private dropbox: Dropbox;

  constructor(dropbox: Dropbox) {
    this.dropbox = dropbox;
  }

  async getAllFiles(): Promise<File[]> {
    console.log('%cdownloading all files', 'font-size:15px');
    const files = await this.dropbox.filesListFolder({path: ''});
    const promises = files.entries.map(async file => {
      let arg: filesTypes.DownloadArg = {
        path: '/' + file.name
      }
      let fileDownload = await this.dropbox.filesDownload(arg);
      let blob: Blob;
      // @ts-ignore
      blob = fileDownload.fileBlob;
      let fileReader = new FileReader();
      let readPromise = new Promise(resolve => fileReader.onload=resolve);
      fileReader.readAsText(blob);
      await readPromise;
      // @ts-ignore
      fileDownload.text = fileReader.result;
      return fileDownload;
    })
    return await Promise.all(promises);
  }
  updateFile(file: File): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addFile(file: File): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
