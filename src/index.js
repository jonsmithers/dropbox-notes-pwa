import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import { Provider } from 'react-redux'
import Utils from './utils/Utils'
const history = createHistory()
const middleware = routerMiddleware(history)
const store = createStore(
  combineReducers({
    router: routerReducer,
    dropbox_api: (state, action) => {
      if (action.type == "hash-change") {
        let {access_token, token_type, uid, account_id}  = Utils.parseQueryString(store.getState().router.location.hash);
        return {access_token, token_type, uid, account_id};
      }
      return {};
    },
    deleteme: (state, action) => {
      console.log("my redux listener", state, action);
      return {}
    },
  }),
  applyMiddleware(middleware)
)

{ // subscribe to keep dropbox_api in sync
  let currentHash = undefined;
  store.subscribe(() => {
    let previousHash = currentHash;
    currentHash = store.getState().router && store.getState().router.location.hash;
    if (currentHash === previousHash) {
      return;
    }
    store.dispatch({type: "hash-change", currentHash})
  });
}

// for debugging
console.log('_store', window._store = store);

ReactDOM.render(
  <Provider store={store}>
      <ConnectedRouter history={history}>
          <App />
      </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
