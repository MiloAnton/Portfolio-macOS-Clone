import { vi } from "vitest";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom";

// @testing-library/dom ne détecte les fake timers qu'à travers le global
// `jest` : sans cet alias, waitFor/findBy bloquent quand les timers sont mockés.
globalThis.jest = vi;

// Node ≥ 25 expose un localStorage global qui vaut undefined sans
// --localstorage-file et masque celui de jsdom : on installe le vrai.
const { window: storageWindow } = new JSDOM("", { url: "http://localhost/" });
Object.defineProperty(globalThis, "localStorage", {
  value: storageWindow.localStorage,
  configurable: true,
  writable: true,
});
globalThis.Storage = storageWindow.Storage;
