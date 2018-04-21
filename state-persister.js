import objectPath from './lib/object-path.js';
import {store, DropboxDispatchers, DropboxCacheDispatchers} from "./app-store.js";
import {Dropbox} from '../lib/dropbox.js';

class DaoInterface {
  constructor() {
    let keys = Object.getOwnPropertyNames(DaoInterface.prototype);
    let unimplementedMethods = keys.filter(key => key !== 'constructor').filter(key => this[key] === DaoInterface.prototype[key]);
    if (unimplementedMethods.length) {
      console.warn('unimplemented methods', unimplementedMethods);
      throw new Error("DaoInterface not been properly implemented");
    }
  }
  /**
   * @param {string} path
   */
  getLastUpdated() {}
  /**
   */
  list() {}
  /**
   * @param {string} path
   */
  read() {}
  update() {}
  create() {}
}
window.DaoInterface = DaoInterface;

class LocalStorageDao extends DaoInterface {
  constructor() { super(); }
}
window.LocalStorageDao = LocalStorageDao;

class DropboxDao extends DaoInterface {
  constructor(accessToken) {
    super();
    // this._dropbox = new Dropbox({ accessToken: store.getState().dropbox.access_token});
    this._dropbox = new Dropbox({accessToken});
  }
  async list(path='') {
    let response = await this._dropbox.filesListFolder({
      path, 
      recursive: false, 
      include_media_info: false, 
      include_deleted: false, 
      include_has_explicit_shared_members: false, 
      include_mounted_folders: false});

    return response.entries.map((entry) => {
      return {
        lastUpdated: Date.parse(entry.server_modified),
        path: entry.path_lower,
        name: entry.name,
        _extras: entry,
      };
    });
  }
  async read(path) {
    let {fileBlob} = await this._dropbox.filesDownload({path});
    let fileReader = new FileReader();
    let readPromise = new Promise(resolve => fileReader.onload=resolve);
    fileReader.readAsText(fileBlob);
    await readPromise;
    return fileReader.result;
  }
  update() {}
  create() {}
  getLastUpdated() {}
  static instance() {
    return new DropboxDao(store.getState().dropbox.access_token);
  }
}
window.DropboxDao = DropboxDao;


if (!store.getState().dropbox.access_token && localStorage.getItem('dropbox-authentication')) {
  DropboxDispatchers.authenticate(JSON.parse(localStorage.getItem('dropbox-authentication')));
}


function watchPath(path, listener) {
  let oldValue = objectPath.get(store.getState(), path);
  store.subscribe(() => {
    let newValue = objectPath.get(store.getState(), path);
    if (newValue != oldValue) {
      listener(newValue, oldValue);
      oldValue = newValue;
    }
  });
}

if (localStorage.getItem('dropboxCache.fileList')) {
  DropboxCacheDispatchers.listFiles(JSON.parse(localStorage.getItem('dropboxCache.fileList')).fileList);
}
watchPath('dropboxCache.fileList', fileList => {
  fileList = {
    fileList,
    timeUpdated: new Date()
  };
  localStorage.setItem('dropboxCache.fileList', JSON.stringify(fileList));
});

if (localStorage.getItem('dropboxCache.files')) {
  let files = JSON.parse(localStorage.getItem('dropboxCache.files')).files;
  Object.entries(files).forEach(([file, contents]) => {
    DropboxCacheDispatchers.setFile(file, contents);
  });
}
watchPath('dropboxCache.files', files => {
  files = {
    files,
    timeUpdated: new Date()
  };
  localStorage.setItem('dropboxCache.files', JSON.stringify(files));
});

if (localStorage.getItem('dropbox.path')) {
  let path = localStorage.getItem('dropbox.path');
  DropboxDispatchers.setPath(path);
}
watchPath('dropbox.path', path => {
  localStorage.setItem('dropbox.path', path);
});
