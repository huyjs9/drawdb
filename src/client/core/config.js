const BASE = import.meta.env.VITE_BACKEND_URL;

export class Interceptors {
  constructor() {
    this._fns = [];
  }

  eject(fn) {
    const index = this._fns.indexOf(fn);
    if (index !== -1) {
      this._fns = [...this._fns.slice(0, index), ...this._fns.slice(index + 1)];
    }
  }

  use(fn) {
    this._fns = [...this._fns, fn];
  }
}

export const config = {
  BASE,
  CREDENTIALS: "include",
  ENCODE_PATH: undefined,
  HEADERS: undefined,
  PASSWORD: undefined,
  RESULT: "body",
  TOKEN: undefined,
  USERNAME: undefined,
  VERSION: "0.1.0",
  WITH_CREDENTIALS: false,
  interceptors: { request: new Interceptors(), response: new Interceptors() },
};
