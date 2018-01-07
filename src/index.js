import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Utils from './utils/Utils'
let Dropbox = require('dropbox');
var dropbox = new Dropbox({ clientId: "n3vr1jhr2vpy2az" });
// var authenticaionUrl = dropbox.getAuthenticationUrl(location.toString())
function getAccessTokenFromUrl() {
    // return utils.parseQueryString(window.location.hash).access_token;
}
function isAuthenticated() {
    return !!getAccessTokenFromUrl();
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
