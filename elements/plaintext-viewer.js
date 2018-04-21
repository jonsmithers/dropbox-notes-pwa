import {QueryMixin} from './query-mixin.js';
import {html, render} from '../node_modules/lit-html/lib/lit-extended.js';

export class PlaintextViewer extends QueryMixin(HTMLElement) {
  static get is() {
    return "plaintext-viewer";
  }
  render() {
    render(html`
      <style>
        :host {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        textarea {
          width: 100%;
          padding: 10px;
          flex-grow: 1;
          font-family: sans-serif;
        }
      </style>
      <app-toolbar>
        <paper-icon-button icon="editor:text-fields" on-click=${() => this.fontSize -= 10} ></paper-icon-button>
        <paper-icon-button icon="editor:format-size" on-click=${() => this.fontSize += 10} ></paper-icon-button>
        <paper-icon-button icon="editor:wrap-text" on-click=${() => this.wrap = !this.wrap} ></paper-icon-button>
        ${this.isEditing ? html`
          <paper-icon-button icon="save" on-click=${() => this._onSave()}></paper-icon-button>
        ` : html`
          <paper-icon-button icon="editor:mode-edit" on-click=${() => this.isEditing = true}></paper-icon-button>
        `}
      </app-toolbar>
      <textarea id="textarea" readOnly=${!this.isEditing} value=${this.value}></textarea>
    `, this.shadowRoot);

    this.$.textarea.style.fontFamily = 'sans-serif';
    this.$.textarea.style.fontSize   = this.fontSize + '%';
    this.$.textarea.style.whiteSpace = this.wrap ? '' : 'pre';

  }
  _onSave() {
    this.isEditing = false;
    this.addEventListener('editor-save', e => {
      console.log('e', e);
    });
    this.fire('editor-save', {
      value: this.$.textarea.value
    });
  }

  constructor() {
    super();
    this.fontSize = 120;
    window.plaintextViewer = this;
    this.attachShadow({mode: 'open'});
    this.render();

    Object.entries({
      'fontFamily': {},
      'isEditing': {value: false},
      'fontSize': {value: 120},
      'value': {value: 'default'},
      'wrap': {},
    }).forEach(([name, {value}]) => {
      this['_' + name] = value;
      Object.defineProperty(this, name, {
        get: () => this['_' + name],
        set: value => {
          this['_' + name] = value;
          this.render();
        }
      });
    });
  }
  // set fontSize(value) {
  //   this._value
  // }
  // set value(value) {
  //   this._value = value;
  //   this.render();
  // }
  // get value() {
  //   return this._value;
  // }
}

customElements.define(PlaintextViewer.is, PlaintextViewer);
