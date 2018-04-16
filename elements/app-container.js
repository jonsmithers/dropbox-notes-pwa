import "./dropbox-authentication-button.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-tabs/paper-tabs.js";
import {store, DropboxCacheDispatchers, DropboxDispatchers} from "../app-store.js";
import "./router.js";
import {html, render} from '../node_modules/lit-html/lib/lit-extended.js';
import {repeat} from '../node_modules/lit-html/lib/repeat.js'
import {until} from '../node_modules/lit-html/lib/until.js'
import {Dropbox} from '../lib/dropbox.js';
import {QueryMixin} from './query-mixin.js';
import objectPath from '../lib/object-path.js';
import {setHash} from '../elements/router.js';
import {toQueryString} from '../utils.js';
import '../state-persister.js';

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
          
          <paper-icon-button icon="settings" on-click=${() => setHash('settings')}></paper-icon-button>
          <paper-icon-button icon="list" on-click=${() => setHash('fileList')}></paper-icon-button>

          </paper-icon-button>
        </app-toolbar>
        ${this.isAuthenticated ? 
            this.computePage(this.pageName) :
            html`<dropbox-authentication-button></dropbox-authentication-button>`}
      </div>
    `, this.shadowRoot);
  }
  computePage(pageName) {
    switch(pageName) {
      case 'fileList':
        return html`
          <div> Files </div>
          ${!this.fileList ? html`
            <paper-button on-click=${() => this.onFetchBtn()}>
              fetch notes
            </paper-button>
            ` : repeat(this.fileList || [], null, (file) => html`
              <paper-item on-click=${() => this.onFileClick(file.path_display)} data="${file}">${file.name}</paper-item>
            `)
         }`;
      case 'file': {
        let path = decodeURIComponent(/file\/(.*?)\?/.exec(location.hash)[1]);
        let contentPromise = this.dropbox.filesDownload({path}).then(async ({fileBlob}) => {
          let fileContents = store.getState().dropboxCache.files[path];
          if (!fileContents) {
            console.log('%cFETCHING FILE FRESH', 'font-size:15px');
            let fileReader = new FileReader();
            let readPromise = new Promise(resolve => fileReader.onload=resolve);
            fileReader.readAsText(fileBlob);
            await readPromise;
            fileContents = fileReader.result;
            DropboxCacheDispatchers.setFile(path, fileContents);
          }
          return html`<pre>${fileContents}</pre>`;
        });
        return until(contentPromise, html`loading...`);
      }
      case 'settings':
        return html`
          <div style="padding: 10px;">
            <p> settings :-P </p>
            <paper-input id="pathInput" label="path/to/dropbox/directory" value=${this.path.replace(/^\//, '')} on-value-changed=${e => this.onPathChange(this.$.pathInput.value)}>
              <span slot="prefix">/</span>
            </paper-input>
          </div>
        `;
      default:
        return html`<div> page "${pageName}" not recognized </div>`;
    }
  }
  onPathChange(path) {
    if (path.length) {
      path = '/'+path
    }
    DropboxDispatchers.setPath(path)
    DropboxCacheDispatchers.listFiles(null);
  }
  async onFileClick(path) {
    setHash(`file/${encodeURIComponent(path)}${toQueryString({view: 'plain'})}`);
  }
  onFetchBtn() {
    this.dropbox.filesListFolder({path: this.path, recursive: false, include_media_info: false, include_deleted: false, include_has_explicit_shared_members: false, include_mounted_folders: false}).then(response => {
      DropboxCacheDispatchers.listFiles(response.entries);
    });
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
    store.subscribe(() => {
      this.isAuthenticated = !!store.getState().dropbox.access_token;
      this.dropbox         = new Dropbox({ accessToken: store.getState().dropbox.access_token});
      this.fileList        = store.getState().dropboxCache.fileList;
      this.pageName        = store.getState().ui.pageName;
      this.path            = store.getState().dropbox.path;
      this.render();
    });
  }
}

customElements.define(AppContainer.is, AppContainer);
