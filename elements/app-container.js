import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/iron-icons/editor-icons.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-toast/paper-toast.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-fab/paper-fab.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-tabs/paper-tabs.js";
import "./dropbox-authentication-button.js";
import "./plaintext-viewer.js";
import "./router.js";
import objectPath from '../lib/object-path.js';
import {DropboxDao} from '../state-persister.js';
import {Dropbox} from '../lib/dropbox.js';
import {QueryMixin} from './query-mixin.js';
import {html, render} from '../node_modules/lit-html/lib/lit-extended.js';
import {repeat} from '../node_modules/lit-html/lib/repeat.js'
import {setHash} from '../elements/router.js';
import {store, DropboxCacheDispatchers, DropboxDispatchers} from "../app-store.js";
import {toQueryString} from '../utils.js';
import {until} from '../node_modules/lit-html/lib/until.js'

export class AppContainer extends QueryMixin(HTMLElement) {
  static get is() {
    return "app-container";
  }
  render() {
    render(html`
      <style>
        app-toolbar {
          background: var(--paper-blue-500);
          color: white;
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

          <paper-icon-button icon="settings" on-click=${() => setHash('settings')}></paper-icon-button>
          <paper-icon-button icon="list" on-click=${() => setHash('fileList')}></paper-icon-button>

        </app-toolbar>
        ${this.isAuthenticated ?
            this.computePage(this.pageName) :
            html`<dropbox-authentication-button></dropbox-authentication-button>`}
        </div>
        <paper-toast id="toast"></paper-toast>
      `, this.shadowRoot);
  }
  computePage(pageName) {
    switch(pageName) {
      case 'fileList':
        return html`
          <paper-icon-button icon="refresh" on-click=${() => this.onFetchBtn()}></paper-icon-button>
          ${repeat(this.fileList || [], null, (file) => html`
            <paper-item on-click=${() => this.onFileClick(file.path)} data="${file}">${file.path}</paper-item>
          `)}
          <style>
            paper-fab#newFile {
              position: fixed;
              right: 20px;
              bottom: 20px;
              background-color: red;
            }
          </style>
          <paper-fab icon="add" id="newFile" on-click=${()=>this.onNewFileClick()}></paper-fab>
        `;
      case 'file': {
        let path = store.getState().ui.pageParams.path;
        let contentPromise = agnosticDao.read(path);
        contentPromise = contentPromise.then(contents =>
          html`<plaintext-viewer value=${contents}></plaintext-viewer>`
        );
        return until(contentPromise, html`loading...`);
      }
      case 'settings':
        return html`
          <div style="padding: 10px;">
            <p> settings :-P </p>
            <paper-input disabled id="pathInput" label="path/to/dropbox/directory" value=${this.path.replace(/^\//, '')} on-value-changed=${() => this.onPathChange(this.$.pathInput.value)}>
              <span slot="prefix">/</span>
            </paper-input>
          </div>
        `;
      default:
        return html`<div> page "${pageName}" not recognized </div>`;
    }
  }
  async onNewFileClick() {
    let {path} = await DropboxDao.instance().create('untitled', 'fake new document');
    console.log('path', path);
    setHash(`file/${encodeURIComponent(path)}${toQueryString({view: 'plain'})}`);
  }
  onPathChange(path) {
    if (path.length) {
      path = '/'+path;
    }
    DropboxDispatchers.setPath(path);
    DropboxCacheDispatchers.listFiles(null);
  }
  async onFileClick(path) {
    setHash(`file/${encodeURIComponent(path)}${toQueryString({view: 'plain'})}`);
  }
  async onFetchBtn() {
    let list = await DropboxDao.instance().list();
    DropboxCacheDispatchers.listFiles(list);
  }
  constructor() {
    super();
    window.appContainer = this; // for dev testing

    this.attachShadow({mode: 'open'});
    this.isAuthenticated = false;
    this.render();
    function watchPath(path, listener) {
      let oldValue = objectPath.get(store.getState(), path);
      store.subscribe(() => {
        let newValue = objectPath.get(store.getState(), path);
        if (newValue != oldValue) {
          listener(newValue, oldValue);
          oldValue = newValue;
        }
      });
    }
    watchPath("dropbox.access_token", (n, o) => {
      console.log('n', n);
      console.log('o', o);
    });
    store.subscribe(async () => {
      this.isAuthenticated = !!store.getState().dropbox.access_token;
      this.dropbox         = new Dropbox({ accessToken: store.getState().dropbox.access_token});
      this.pageName        = store.getState().ui.pageName;
      this.path            = store.getState().dropbox.path;
      await agnosticDao.list().then(list => this.fileList = list)
      this.render();
    });
    this.addEventListener('editor-save', async ({detail: {value}}) => {
      try {
        let path = store.getState().ui.pageParams.path;
        this.$.toast.show({text: 'One sec...'});
        await DropboxDao.instance().update(path, value);
        setTimeout(() => this.$.toast.show({text: 'Saved'}), 500);
        console.log('value', value);
      } catch(e) {
        this.$.toast.show({text: 'ERROR'});
        console.error(e);
      }
    });
  }
}

customElements.define(AppContainer.is, AppContainer);
