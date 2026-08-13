if (typeof localStorage !== "undefined" && typeof localStorage.getItem !== "function") {
  const noop = () => {};
  const empty = () => null;
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: empty,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: empty,
    get length() { return 0; },
  };
}
