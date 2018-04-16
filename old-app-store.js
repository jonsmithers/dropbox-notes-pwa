class PubSubHub {
  constructor() {
    this._eventTarget = new EventTarget();
  }
  subscribe(event, listener) {
    this._eventTarget.addEventListener(event, (e => {
      listener.call(null, e.detail);
    }));
  }
  publish(event, data) {
    this._eventTarget.dispatchEvent(new CustomEvent(event, {detail: data}));
  }
}

class AppStore {
  constructor(reducer, initialState) {
    this.state = initialState
    this.reducer = reducer;
    this._pubsubhub = new PubSubHub();
  }
  get(path) {
    return path.split('.').reduce((pathItem, currentValue) => {
      if (!currentValue) {
        throw new Error("path does not exist");
      }
      return currentValue[pathItem];
    }, this.state);
  }
  update(path, value) {
    let pathItems = path.split('.');
    for (let i in pathItems.slice(0, -1)) {
      let currentPath = pathItems.slice(0, i+1).join('.')
      if (this.state[currentPath] == null) {
        console.warn(path, this.state);
        throw new Error("path does not exist");
      }
    }
    let oldValue = pathItems.reduce((ref, pathItem) => ref[pathItem], this.state);
    if (value != oldValue) {
      this._pubsubhub.publish(path);
    }
  }
  subscribe(path, listener) {
    let pathItems = path.split('.');
    for (let i in pathItems) {
      this._pubsubhub.subscribe(pathItems.slice(0, i+1).join('.'), listener);
    }
  }
  dispatch(action) {
    this.state = this.reducer(this.state, action);
  }
}

let x = new AppStore(null, {a:{b: 5}});
