import React, { Component } from 'react';
let Dropbox = require('dropbox');
let dropbox = new Dropbox({ clientId: "n3vr1jhr2vpy2az" });


class DropboxAuthenticationButton extends Component {
  get authenticationUrl() {
    return dropbox.getAuthenticationUrl(window.location.toString());
  }
  render() {
    return (
      <div>
        <div>hi</div>
        <a href={this.authenticationUrl}>authenticate</a>
      </div>
    )
  }
}
export default DropboxAuthenticationButton;
