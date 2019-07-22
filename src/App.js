import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Dropbox } from 'dropbox'
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createContainer } from "unstated-next"

function useDropboxCredentials(initialState = null) {
  let [credentials, setCredentials] = useState(initialState)
  return { credentials, setCredentials }
}
const DropboxCredentials = createContainer(useDropboxCredentials)


const dropbox = new Dropbox({ clientId: "wl4k2y0xsplg260"  });
const authUrl = dropbox.getAuthenticationUrl(window.location.toString())

function App() {
  return (
    <DropboxCredentials.Provider>
      <Router>
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
          <Route exact path="/" component={Home}/>
          <Route path="/about" component={About} />
        </Router>
    </DropboxCredentials.Provider>
  );
}

function About() {
  console.log("WUT");
  return (
    <span>about!</span>
  )
}

function Home() {
  const dropboxCredentials = DropboxCredentials.useContainer();
  useEffect(() => {
    const location = window.location;
    console.log('dropboxCredentials.credentials', dropboxCredentials.credentials);
    if (location.hash) {
      const params = new URLSearchParams(location.hash.slice(1));
      dropboxCredentials.setCredentials(Array.from(params.entries()).reduce((accumulator, [k,v]) => {
        accumulator[k] = v;
        return accumulator;
      }, {}));
      location.hash = '';
      // location.href = location.href.replace(/#.*$/, '')
    }
  });
  return (
    <div>
      <span>Im home</span>
        {dropboxCredentials.credentials ? <span>dropbox logged in </span> :
            <a
              className="App-link"
              href={authUrl}
            >dropbox</a>
        }
    </div>
  );
}

export default App;
