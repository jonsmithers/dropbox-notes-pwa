import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import { Provider } from 'react-redux'
const history = createHistory()
const middleware = routerMiddleware(history)
const store = createStore(
  combineReducers({
    // ...reducers,
    router: routerReducer
  }),
  applyMiddleware(middleware)
)
console.log(window._store = store);


ReactDOM.render(
  <Provider store={store}>
      <ConnectedRouter history={history}>
          <App /> 
      </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
