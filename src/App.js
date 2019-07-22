import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Dropbox } from 'dropbox'
import { BrowserRouter as Router, Route } from "react-router-dom";

const dropbox = new Dropbox({ clientId: "wl4k2y0xsplg260"  });
const authUrl = dropbox.getAuthenticationUrl(window.location.toString())

function App() {
  return (
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
          <a
            className="App-link"
            href={authUrl}
          >dropbox</a>
        </header>
      </div>
      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About} />
    </Router>
  );
}

function About() {
  console.log("WUT");
  return (
    <span>about!</span>
  )
}

function Home() {
  useEffect(() => {
    const location = window.location;
    if (location.hash) {
      const params = new URLSearchParams(location.hash.slice(1));
      console.log('params object', Array.from(params.entries()).reduce((accumulator, [k,v]) => {
        accumulator[k] = v;
        return accumulator;
      }, {}));
      location.hash = '';
    }
  });
  return (
    <div>I&apos;m home</div>
  );
}

export default App;
