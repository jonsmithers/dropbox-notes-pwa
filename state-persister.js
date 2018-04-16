import objectPath from '../lib/object-path.js';
import {store, DropboxCacheDispatchers} from "../app-store.js";


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
