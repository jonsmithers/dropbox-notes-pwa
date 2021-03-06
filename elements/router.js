import {parseQueryString} from '../utils.js';
import {store, DropboxDispatchers, UiDispatchers} from '../app-store.js';

export function setHash(hash) {
  location = '#' + hash;
  // history.pushState(null, null, '#' + hash); <-- doesn't trigger hashchange event
}

function onHashChange(hash) {

  let parseResults = parseQueryString(location.hash);
  if (parseResults.access_token) {
    localStorage.setItem('dropbox-authentication', JSON.stringify(parseResults));
    DropboxDispatchers.authenticate(parseResults);
    let hash = sessionStorage.getItem('return to hash');
    sessionStorage.removeItem('return to hash');
    setHash(hash);
    return;
  }

  switch(true) {
    case ('#fileList' == hash): {
      UiDispatchers.changePage("fileList");
      break;
    }
    case ('#settings' == hash): {
      UiDispatchers.changePage("settings");
      break;
    }
    case /#file\/(.*)/.test(hash): {
      let path = decodeURIComponent(/file\/(.*?)\?/.exec(location.hash)[1]);
      UiDispatchers.changePage("file", {...parseQueryString(hash.slice(hash.indexOf('?'))), path});
      break;
    }
    case ('' == hash): {
      UiDispatchers.changePage("home?");
      break;
    }
    default: {
      UiDispatchers.changePage("not recognized");
    }
  }
}

window.addEventListener('hashchange', () => {
  onHashChange(location.hash);
});
setTimeout(() => {
  onHashChange(location.hash);
}, 1);
