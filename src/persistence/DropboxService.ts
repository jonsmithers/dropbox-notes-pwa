import { useState } from 'react';
import { PersistenceService, File } from './PersistenceService';
import { Dropbox, files as filesTypes } from 'dropbox'
import { createContainer, Container } from "unstated-next"

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

export function useDropboxService(dropboxCredentials: typeof DropboxCredentials): PersistenceService|null {
  const dropboxCredentialsContainer = dropboxCredentials.useContainer();
  const [dropboxService, setDropboxService] = useState<DropboxService|null>(null);
  if (dropboxCredentialsContainer.credentials && !dropboxService) {
    setDropboxService(new DropboxService(new Dropbox({ accessToken: dropboxCredentialsContainer.credentials.access_token })))
  }
  return dropboxService;
}

export type DropboxCredState = {
  credentials: {
    [index: string]: string
    access_token: string;
  } | null
};
function useDropboxCredentials(initialCredState: DropboxCredState['credentials'] = null) {
  let [credentials, setCredentials] = useState(initialCredState)
  return { credentials, setCredentials }
}
export const DropboxCredentials = createContainer(useDropboxCredentials)
