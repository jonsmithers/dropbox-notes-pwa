import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DropboxAuthenticationButton from './components/DropboxAuthenticationButton';
import { connect } from 'react-redux'
import Utils from './utils/Utils'

function mapStateToProps(state) {
  let {access_token, token_type, uid, account_id}  = Utils.parseQueryString(state.router.location.hash);
  return {
    dropboxStuff: {
      access_token,
      token_type,
      uid,
      account_id
    }
  }
}

let App = connect(mapStateToProps)(class extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <DropboxAuthenticationButton></DropboxAuthenticationButton>
        <p>
          {this.props.myReduxText}
        </p>
        <p>
          {this.props.dropboxStuff.access_token }
        </p>
        <p>
          {this.props.dropboxStuff.token_type }
        </p>
      </div>
    );
  }
})

export default App;
