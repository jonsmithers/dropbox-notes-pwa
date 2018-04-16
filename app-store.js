import {createStore, combineReducers} from './lib/redux';
import {parseQueryString} from './utils.js';

function uiReducer(state, action) {
  switch(action.type) {
    case 'ui-change-page':
      return {
        ...state,
        pageName: action.newPageName,
        pageParams: action.newPageParams
      };
    default: 
      return state || {
        pageName: "no page?"
      }
  }
}
export let UiDispatchers = {
  changePage(newPageName, newPageParams={}) {
    store.dispatch({
      newPageName,
      newPageParams,
      type: "ui-change-page"
    });
  }
};

function dropboxReducer(state, action) {
  switch(action.type) {
    case 'dropbox-authenticate': {
      let {access_token, token_type, uid, account_id} = action;
      return { ...state, access_token, token_type, uid, account_id};
    }
    default:
      return state || {
        access_token: null,
        token_type: null,
        uid: null,
        account_id: null
      };
  }
}
export let DropboxDispatchers = {
  authenticate(stuff) {
    let action = {
      ...stuff,
      type: 'dropbox-authenticate'
    };
    store.dispatch(action);
  }
}

function dropboxCacheReducer(state, action) {
  switch(action.type) {
    case('dropboxcache-listFiles'): {
      return {
        ...state,
        files: {},
        fileList: action.fileList
      }
    }
    case('dropboxcache-setFile'): {
      state.files = {
        ...state.files,
        [action.name]: action.contents
      }
      return state;
    }
    default:
      return state || {
        fileList: null
      }
  }
}
export let DropboxCacheDispatchers = {
  setFile(name, contents) {
    store.dispatch({
      name,
      contents,
      type: 'dropboxcache-setFile'
    });
  },
  listFiles(fileList) {
    if (!Array.isArray(fileList)) throw new Error('need array');
    store.dispatch({
      fileList,
      type: 'dropboxcache-listFiles'
    });
  }
}

let rootReducer = combineReducers({ui: uiReducer, dropbox: dropboxReducer, dropboxCache: dropboxCacheReducer});
export let store = createStore(rootReducer);
window.store = store; // for dev testing

