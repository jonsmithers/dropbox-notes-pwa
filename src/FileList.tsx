import React, { useEffect, useState } from 'react';
import './App.css';
import { Dropbox, files as filesTypes } from 'dropbox'
import Button from '@material-ui/core/Button';
import { useDropboxService, DropboxCredentials, DropboxCredState } from './persistence/DropboxService';
import { useIndexedDBService } from './persistence/IndexedDBService';
import { File } from './persistence/PersistenceService';

function FileList() {
  const dbs = useDropboxService(DropboxCredentials)
  const idb = useIndexedDBService();
  const [files, setFiles] = useState<File[]|null>(null);
  const [dbFiles, setDbFiles] = useState<File[]|null>(null);
  useEffect(() => {
    idb.getAllFiles().then(files => {
      console.log('idb files', files);
      setFiles(files);
    })
  }, []);
  useEffect(() => {
    if (!dbs || dbFiles) {
      return
    }
    dbs.getAllFiles().then(files => {
      console.log('db files', files);
      setDbFiles(files);
      // for (let file of files) {
      //   idb.addFile(file);
      // }
    });
  }, [dbs, dbFiles]);
  useEffect(() => {
    console.group('thing');
    console.log('dbFiles', dbFiles);
    console.log('files', files);
    console.groupEnd();
  }, [files, dbFiles]);
  return (
    <div>
      {files ? files.map(file => (<div key={file.name}>{file.name}</div>)) : <span>loading files...</span>}
    </div>
  );

}

export default FileList;
