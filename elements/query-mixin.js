export const QueryMixin = (clazz) => class extends clazz {
  constructor() {
    super();
    this.$ = new Proxy({}, {
      get: (target, prop) => {
        return this.shadowRoot.getElementById(prop);
      },
      set: () => {throw new Error('not allowed');}
    });
  }
  $$(cssSelector) {
    return this.shadowRoot.querySelector(cssSelector);
  }
  $all(cssSelector) {
    return [...this.shadowRoot.querySelectorAll(cssSelector)];
  }
  fire(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true, // pass thru shadow-doms
      detail
    }));
  }
};
