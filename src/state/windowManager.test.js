import {
  createInitialWindowsState,
  getActiveWindowId,
  WINDOW_ACTIONS,
  windowsReducer,
} from "./windowManager";

const registry = [
  { id: "main", openOnDesktop: true, initialZIndex: 1 },
  { id: "terminal", openOnDesktop: true, initialZIndex: 2 },
  { id: "notes" },
];

describe("windowsReducer", () => {
  test("opens only the configured showcase windows on desktop", () => {
    const state = createInitialWindowsState(registry, true);
    expect(state.byId.main.isOpen).toBe(true);
    expect(state.byId.terminal.isOpen).toBe(true);
    expect(state.byId.notes.isOpen).toBe(false);
    expect(getActiveWindowId(state)).toBe("terminal");
  });

  test("starts with every window closed on mobile", () => {
    const state = createInitialWindowsState(registry, false);
    expect(Object.values(state.byId).every((item) => !item.isOpen)).toBe(true);
    expect(getActiveWindowId(state)).toBeNull();
  });

  test("opens, focuses, minimizes, restores and closes a window", () => {
    let state = createInitialWindowsState(registry, false);
    state = windowsReducer(state, { type: WINDOW_ACTIONS.OPEN, id: "notes" });
    expect(state.byId.notes.isOpen).toBe(true);
    expect(getActiveWindowId(state)).toBe("notes");

    state = windowsReducer(state, { type: WINDOW_ACTIONS.START_MINIMIZE, id: "notes" });
    state = windowsReducer(state, { type: WINDOW_ACTIONS.FINISH_MINIMIZE, id: "notes" });
    expect(state.byId.notes.isMinimized).toBe(true);

    state = windowsReducer(state, { type: WINDOW_ACTIONS.TOGGLE, id: "notes" });
    expect(state.byId.notes.isMinimized).toBe(false);

    state = windowsReducer(state, { type: WINDOW_ACTIONS.START_CLOSE, id: "notes" });
    state = windowsReducer(state, { type: WINDOW_ACTIONS.FINISH_CLOSE, id: "notes" });
    expect(state.byId.notes.isOpen).toBe(false);
  });

  test("resets fullscreen when a window closes", () => {
    let state = createInitialWindowsState(registry, false);
    state = windowsReducer(state, { type: WINDOW_ACTIONS.OPEN, id: "notes" });
    state = windowsReducer(state, { type: WINDOW_ACTIONS.TOGGLE_FULLSCREEN, id: "notes" });
    state = windowsReducer(state, { type: WINDOW_ACTIONS.TOGGLE, id: "notes" });
    expect(state.byId.notes.isFullscreen).toBe(false);
  });
});
