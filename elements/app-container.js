import "./dropbox-authentication-button.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-tabs/paper-tabs.js";
import {store} from "../app-store.js";
import "./router.js";
import {html, render} from 'lit-html';
import {repeat} from '../node_modules/lit-html/lib/repeat.js'
import {Dropbox} from '../lib/dropbox.js';
import {QueryMixin} from './query-mixin.js';

export class AppContainer extends QueryMixin(HTMLElement) {
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
          <paper-button id="fetchBtn">
            fetch notes
          </paper-button>
        ` : html`
          <dropbox-authentication-button></dropbox-authentication-button>
        `}
        ${repeat(this.fileList || [], null, (file, index) => html`
          <paper-item>${file.name}</paper-item>
        `)};
      </div>
    `, this.shadowRoot);
  }
  constructor() {
    super();
    window.testhing = this;
    this.attachShadow({mode: 'open'});
    this.isAuthenticated = false;
    this.render();
    console.log(this.shadowRoot);
    store.subscribe(() => {
      this.isAuthenticated = store.getState().dropbox.access_token;
      this.render();
      if (this.isAuthenticated) {
        this.$.fetchBtn.addEventListener('click', () => {
          dropbox.filesListFolder({path: '/vim-notes', recursive: false, include_media_info: false, include_deleted: false, include_has_explicit_shared_members: false, include_mounted_folders: false}).then(response => {
            console.log(response.entries);
            this.fileList = response.entries;
            this.render();
          });
        });
        let dropbox = new Dropbox({ accessToken: store.getState().dropbox.access_token});
        window.thedropbox = dropbox; // for dev testing
      }
    });
  }
}

customElements.define(AppContainer.is, AppContainer);
