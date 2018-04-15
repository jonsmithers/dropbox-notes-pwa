import {parseQueryString} from '../utils.js';
import {DropboxDispatchers} from '../app-store.js';

function onHashChange(hash) {
  if (!hash) {
    if (localStorage.getItem('dropbox-authentication')) {
      DropboxDispatchers.authenticate(JSON.parse(localStorage.getItem('dropbox-authentication')));
    }
  }
  let parseResults = parseQueryString(location.hash);
  if (parseResults.access_token) {
    localStorage.setItem('dropbox-authentication', JSON.stringify(parseResults));
    DropboxDispatchers.authenticate(parseResults);
    history.pushState(null, null, '#');
    return;
  }
}

window.addEventListener('hashchange', () => {
  onHashChange(location.hash);
});
setTimeout(() => {
  onHashChange(location.hash);
}, 1);
