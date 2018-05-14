import objectPath from './lib/object-path.js';
import {store, DropboxDispatchers, DropboxCacheDispatchers} from "./app-store.js";
import {Dropbox} from './lib/dropbox.js';

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
   */
  list() {}
  /**
   * @param {string} path
   */
  read() {}
  update() {}
  delete() {}
  create() {}
}
window.DaoInterface = DaoInterface;

class LocalStorageDao extends DaoInterface {
  constructor() { super(); }
  async list(path='') {
    return JSON.parse(localStorage.getItem(`dao-cache-list-${path}`)) || [];
  }
  async update(path, contents) {
    let newList = await this.list();
    let basePath = this._basePath(path);
    let fileEntry = newList.find(i => i.path === path);
    if (!fileEntry) {
      throw new Error(`${path} does not exist in dao`);
    }
    fileEntry.lastUpdated = Date.now();
    localStorage.setItem(`dao-cache-list-${basePath}`, JSON.stringify(newList));
    localStorage.setItem(`dao-cache-file-${path}`, contents);

  }
  async delete(path) {
    let basePath = this._basePath(path);
    let newList = (await this.list(basePath)).filter(i => i.path !== path);
    localStorage.setItem(`dao-cache-list-${basePath}`, JSON.stringify(newList));
    localStorage.removeItem(`dao-cache-file-${path}`);
  }
  async read(path) {
    return localStorage.getItem(`dao-cache-file-${path}`);
  }
  _basePath(path) {
    return path.replace(/\/?[^/]*$/, '');
  }
  async create(path, contents) {
    // TODO need to check for existing file
    let basePath = this._basePath(path);
    let newList = [
      ...await this.list(basePath),
      {
        lastUpdated: Date.now(),
        path,
      }
    ];
    let dupeCheck = newList.filter(i => i.path === path).length;
    if (dupeCheck > 1) {
      throw new Error("this file already exists. This situation is not handled yet");
    }
    localStorage.setItem(`dao-cache-list-${basePath}`, JSON.stringify(newList));
    localStorage.setItem(`dao-cache-file-${path}`, contents);
  }
}
let localDao = new LocalStorageDao();
window.localDao = localDao;

export class DropboxDao extends DaoInterface {
  constructor(accessToken, basePath='') {
    super();
    if (typeof accessToken !== 'string') {
      throw new Error("need access token");
    }
    this.basePath = basePath;
    this._dropbox = new Dropbox({accessToken});
    // this._dropbox = new Dropbox({ accessToken: store.getState().dropbox.access_token});
  }
  async list(path='') {
    let response = await this._dropbox.filesListFolder({
      path: this.basePath + path,
      recursive: false,
      include_media_info: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: false});

    return response.entries.map(this._mapListing);
  }
  async delete(path) {
    if (!path) {
      throw new Error("need path");
    }

    path = (this.basePath || '/') + path;
    return await this._dropbox.filesDelete({path});
  }
  async read(path) {
    path = (this.basePath || '/') + path;
    let {fileBlob} = await this._dropbox.filesDownload({path});
    let fileReader = new FileReader();
    let readPromise = new Promise(resolve => fileReader.onload=resolve);
    fileReader.readAsText(fileBlob);
    await readPromise;
    return fileReader.result;
  }
  async update(path, contents) { // this adds files if they don't exist
    path = (this.basePath || '/') + path;
    let result = await this._dropbox.filesUpload({
      autorename: true,
      contents,
      mode: {'.tag': 'overwrite'}, // TODO make this update so it's not dangerous
      mute: false,
      path: this.basePath + path,
    });
    return this._mapListing(result);
  }
  async create(path, contents) {
    path = (this.basePath || '/') + path;
    let result = await this._dropbox.filesUpload({
      autorename: true,
      contents,
      mode: {'.tag': 'add'},
      mute: false,
      path: this.basePath + path,
    });
    return this._mapListing(result);
  }
  static instance() {
    return new DropboxDao(store.getState().dropbox.access_token);
  }
  _mapListing(entry) {
    return {
      lastUpdated: Date.parse(entry.server_modified),
      path: entry.path_lower.slice(1),
      name: entry.name,
      _extras: entry,
    };
  }
}
setTimeout( () => window.dropboxDao = DropboxDao.instance(), 1000);

class AgnosticDao extends DaoInterface {
  list() {
    return navigator.onLine ?
      DropboxDao.instance().list(...arguments) :
      localDao.list(...arguments);
  }
  read(path) {
    if (navigator.onLine) {
      let result = DropboxDao.instance().read(...arguments);
      result.then(contents =>
        localDao.update(path, contents)
      );
      return result;
    } else {
      return localDao.read(path);
    }
  }
  update() {
    if (navigator.onLine) {
      let result = DropboxDao.instance().update(...arguments);
      localDao.update(...arguments);
      return result;
    } else {
      return localDao.update(...arguments);
    }
  }
  delete() {
    if (navigator.onLine) {
      let result = DropboxDao.instance().delete(...arguments);
      localDao.delete(...arguments);
      return result;
    } else {
      throw new Error("can't delete while offline");
    }
  }
  create() {
    if (navigator.onLine) {
      let result = DropboxDao.instance().create(...arguments);
      localDao.create(...arguments);
      return result;
    } else {
      return localDao.create(...arguments);
    }
  }
}
window.agnosticDao = new AgnosticDao();


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
