import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Dropbox } from 'dropbox'

const dropbox = new Dropbox({ clientId: "wl4k2y0xsplg260"  });
const authUrl = dropbox.getAuthenticationUrl(window.location.toString())

function App() {
  useEffect(() => {
    console.log('hello')
    console.log(authUrl);
  })
  return (
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
        >
          Learn React
        </a>
        <a
          className="App-link"
          href={authUrl}
        >dropbox</a>
      </header>
    </div>
  );
}

export default App;
