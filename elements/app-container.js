import "./dropbox-authentication-button.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-tabs/paper-tabs.js";
import {PolymerElement, html} from "@polymer/polymer/polymer-element.js";
import {store} from "../app-store.js";
import "./router.js";

export class AppContainer extends PolymerElement {
  static get is() {
    return "app-container";
  }
  static get template() {
    return html`
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
        <template is="dom-if" if="[[!isAuthenticated]]">
          <dropbox-authentication-button></dropbox-authentication-button>
        </template>
        <template is="dom-if" if="[[isAuthenticated]]">
          <div> we authenticated </div>
        </template>
      </div>
    `;
  }
  constructor() {
    super();
    this.isAuthenticated = false;
    console.log('isAuthenticated', this.isAuthenticated);
    store.subscribe(() => {
      this.isAuthenticated = store.getState().dropbox.access_token;
      console.log('isAuthenticated', this.isAuthenticated);
    });
  }
}

customElements.define(AppContainer.is, AppContainer);
