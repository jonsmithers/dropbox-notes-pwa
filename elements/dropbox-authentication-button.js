import "@polymer/paper-button/paper-button.js";
import {PolymerElement, html} from "@polymer/polymer/polymer-element.js";
export class DropboxAuthenticationButton extends PolymerElement {
  static get is( ){
    return 'dropbox-authentication-button';
  }
  static get template() {
    return html`
      <style>
        a {
          text-decoration: none;
        }
        paper-button {
        }
      </style>
      <a href="[[_authenticationUrl]]">
        <paper-button raised>
          <svg class="maestro-nav__logo" aria-label="Home" xmlns="http://www.w3.org/2000/svg" role="img" width="32px" height="32px" viewBox="0 0 32 32" style="fill:#0062ff;" data-reactid="12"><title data-reactid="13"></title><path d="M8 2.4l8 5.1-8 5.1-8-5.1 8-5.1zm16 0l8 5.1-8 5.1-8-5.1 8-5.1zM0 17.7l8-5.1 8 5.1-8 5.1-8-5.1zm24-5.1l8 5.1-8 5.1-8-5.1 8-5.1zM8 24.5l8-5.1 8 5.1-8 5.1-8-5.1z" data-reactid="14"></path></svg>
          &nbsp;Authenticate
        </paper-button>
      </a>
    `;
  }
  constructor(){
    super();
    let dropbox = new Dropbox.Dropbox({ clientId: "n3vr1jhr2vpy2az" });
    this._authenticationUrl = dropbox.getAuthenticationUrl(window.location.toString());
  }
}

customElements.define(DropboxAuthenticationButton.is, DropboxAuthenticationButton);
