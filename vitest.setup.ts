import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

function createStorageMock(): Storage {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: () => {
      store = {};
    },
    getItem: (key) => store[key] ?? null,
    key: (index) => Object.keys(store)[index] ?? null,
    removeItem: (key) => {
      delete store[key];
    },
    setItem: (key, value) => {
      store[key] = String(value);
    },
  };
}

Object.defineProperty(window, "localStorage", {
  value: createStorageMock(),
  configurable: true,
});

beforeEach(() => {
  window.localStorage.clear();
});
