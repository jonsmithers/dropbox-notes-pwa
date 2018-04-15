import {createStore, combineReducers} from './lib/redux';
import {parseQueryString} from './utils.js';


let rootReducer = combineReducers({dropbox: dropboxReducer});

function dropboxReducer(state, action) {
  switch(action.type) {
    case 'dropbox-authenticate': {
      let {access_token, token_type, uid, account_id} = action;
      return {access_token, token_type, uid, account_id};
    }
    default:
      return {
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
export let store = createStore(rootReducer);
window.store = store; // for dev testing

