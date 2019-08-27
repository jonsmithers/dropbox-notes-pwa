import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Dropbox, files as filesTypes } from 'dropbox'
import { BrowserRouter as Router, Route } from "react-router-dom";
import Button from '@material-ui/core/Button';
import { useDropboxService, DropboxCredentials, DropboxCredState } from './persistence/DropboxService';
import { useIndexedDBService } from './persistence/IndexedDBService';
import { File } from './persistence/PersistenceService';

const dropbox_credential_prefix = 'dropbox-credentials.';

const dropbox = new Dropbox({ clientId: "wl4k2y0xsplg260", fetch: window.fetch });
const authUrl = dropbox.getAuthenticationUrl(window.location.toString())

function App() {
  return (
    <DropboxCredentials.Provider>
      <DropboxLoginPopup />
      <Router>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About} />
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          > Learn React </a>
    </header>
  </div>
    </Router>
  </DropboxCredentials.Provider>
  );
}

function About() {
  return (
    <span>about!</span>
  )
}

function DropboxLoginPopup() {
  const dropboxCredentials = DropboxCredentials.useContainer();
  useEffect(() => {
    // get creds from dropbox return url
    const location = window.location;
    if (location.hash) {
      const params = new URLSearchParams(location.hash.slice(1));

      type KeyValPair = [string, string]
      const paramsObject: DropboxCredState['credentials'] = Array.from(params.entries()).reduce((accumulator: Partial<DropboxCredState['credentials']>, [k, v]: KeyValPair) => {
        accumulator![k] = v;
        return accumulator;
      }, {}) as DropboxCredState['credentials'];

      for (let [key, val] of params.entries()) {
        sessionStorage.setItem(`${dropbox_credential_prefix}${key}`, val);
      }
      dropboxCredentials.setCredentials(paramsObject);
      location.hash = '';
    }
  });
  useEffect(() => {
    // get creds from session stroage
    if (!dropboxCredentials.credentials && sessionStorage.getItem(`${dropbox_credential_prefix}access_token`)) {
      const credentials: Partial<DropboxCredState['credentials']> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key: string = sessionStorage.key(i)!;
        if (key.startsWith(dropbox_credential_prefix)) {
          credentials[key.replace(dropbox_credential_prefix, '')] = sessionStorage.getItem(key)!;
        }
      }
      dropboxCredentials.setCredentials(credentials as DropboxCredState['credentials']);
    }
  })
  if (dropboxCredentials.credentials) {
    return <></>
  }
  return (
    <a href={authUrl} style={{textDecoration: 'none'}}>
      <Button variant="contained">
        <svg xmlns="http://www.w3.org/2000/svg" role="img" width="32px" height="32px" viewBox="0 0 32 32" style={{fill:'#0062ff'}} data-reactid="12"><title data-reactid="13"></title><path d="M8 2.4l8 5.1-8 5.1-8-5.1 8-5.1zm16 0l8 5.1-8 5.1-8-5.1 8-5.1zM0 17.7l8-5.1 8 5.1-8 5.1-8-5.1zm24-5.1l8 5.1-8 5.1-8-5.1 8-5.1zM8 24.5l8-5.1 8 5.1-8 5.1-8-5.1z" data-reactid="14"></path></svg>
          &nbsp;
          Authenticate Dropbox
      </Button>
    </a>
  );
}

function Home() {
  const dbs = useDropboxService(DropboxCredentials)
  const idb = useIndexedDBService();
  const [files, setFiles] = useState<File[]|null>(null);
  useEffect(() => {
    idb.getAllFiles().then(files => {
      console.log('idb files', files);
      setFiles(files);
    })
  }, []);
  // useEffect(() => {
  //   dbs && dbs.getAllFiles().then(files => {
  //     console.log('db files', files);
  //     setFiles(files);
  //     for (let file of files) {
  //       idb.addFile(file);
  //     }
  //   });
  // }, [dbs]);
  return (
    <div>
      <span>Im home</span>
      <div>
          {files ? files.map(file => (<div key={file.name}>{file.name}</div>)) : <span>loading files...</span>}
      </div>
    </div>
  );
}

export default App;
