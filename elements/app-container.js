import "./dropbox-authentication-button.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-tabs/paper-tabs.js";
import {store} from "../app-store.js";
import "./router.js";
import {html, render} from 'lit-html';
import {Dropbox} from '../lib/dropbox.js';

export class AppContainer extends HTMLElement {
  static get is() {
    return "app-container";
  }
  render() {
    render(html`
      <style>
        swipe-tabs {
          width: 100%;
          box-sizing: border-box;
          /* height: calc(100vh - 128px); */
          /* border:5px solid black; */
        }
        app-toolbar {
          background: var(--paper-blue-500);
          color: white;
        }
        app-toolbar paper-tabs {
          height:100%;
          width: 100%;
        }
        .verticalFlex {
          display: flex;
          flex-direction: column;
          height: 100%; /* vh has weirdness with hiding url bar */
        }
        .verticalFlex > * {
          flex-shrink: 0;
        }
        .flewGrow {
          flex-grow: 1;
          height: 0;
        }
      </style>
      <div id="flexContainer" class="verticalFlex">
        <app-toolbar>
          Hello there
        </app-toolbar>
        ${this.isAuthenticated ? html`
          <paper-button>
            fetch notes
          </paper-button>
        ` : html`
          <dropbox-authentication-button></dropbox-authentication-button>
        `}
      </div>
    `, this.shadowRoot);
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.isAuthenticated = false;
    this.render();
    store.subscribe(() => {
      this.isAuthenticated = store.getState().dropbox.access_token;
      console.log('isAuthenticated', this.isAuthenticated);
      this.render();
    });
  }
}

customElements.define(AppContainer.is, AppContainer);
