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
  { id: "games" },
];

const reduce = (state, type, id) =>
  windowsReducer(state, { type, id });

describe("windowsReducer", () => {
  test("opens only the configured showcase windows on desktop", () => {
    const state = createInitialWindowsState(registry, true);

    expect(state.byId.main.isOpen).toBe(true);
    expect(state.byId.terminal.isOpen).toBe(true);
    expect(state.byId.notes.isOpen).toBe(false);
    expect(state.nextZIndex).toBe(3);
    expect(getActiveWindowId(state)).toBe("terminal");
  });

  test("starts with every window closed on mobile", () => {
    const state = createInitialWindowsState(registry, false);

    expect(Object.values(state.byId).every((item) => !item.isOpen)).toBe(true);
    expect(getActiveWindowId(state)).toBeNull();
  });

  test("opens a window and assigns it the highest z-index", () => {
    const initialState = createInitialWindowsState(registry, true);
    const state = reduce(initialState, WINDOW_ACTIONS.OPEN, "notes");

    expect(state.byId.notes).toMatchObject({
      isOpen: true,
      isMinimized: false,
      isClosing: false,
      zIndex: initialState.nextZIndex,
    });
    expect(state.nextZIndex).toBe(initialState.nextZIndex + 1);
    expect(getActiveWindowId(state)).toBe("notes");
  });

  test("focuses an open window and preserves a strict foreground order", () => {
    let state = createInitialWindowsState(registry, true);
    const terminalZIndex = state.byId.terminal.zIndex;

    state = reduce(state, WINDOW_ACTIONS.FOCUS, "main");
    expect(state.byId.main.zIndex).toBeGreaterThan(terminalZIndex);
    expect(getActiveWindowId(state)).toBe("main");

    state = reduce(state, WINDOW_ACTIONS.OPEN, "notes");
    expect(state.byId.notes.zIndex).toBeGreaterThan(state.byId.main.zIndex);
    expect(getActiveWindowId(state)).toBe("notes");
  });

  test("does not focus a closed or minimized window", () => {
    let state = createInitialWindowsState(registry, false);
    expect(reduce(state, WINDOW_ACTIONS.FOCUS, "notes")).toBe(state);

    state = reduce(state, WINDOW_ACTIONS.OPEN, "notes");
    state = reduce(state, WINDOW_ACTIONS.START_MINIMIZE, "notes");
    state = reduce(state, WINDOW_ACTIONS.FINISH_MINIMIZE, "notes");

    expect(reduce(state, WINDOW_ACTIONS.FOCUS, "notes")).toBe(state);
    expect(getActiveWindowId(state)).toBeNull();
  });

  test("minimizes a window then restores and focuses it from the Dock", () => {
    let state = createInitialWindowsState(registry, true);
    state = reduce(state, WINDOW_ACTIONS.OPEN, "notes");
    state = reduce(state, WINDOW_ACTIONS.START_MINIMIZE, "notes");

    expect(state.byId.notes).toMatchObject({
      isOpen: true,
      isClosing: true,
      isMinimized: false,
    });

    state = reduce(state, WINDOW_ACTIONS.FINISH_MINIMIZE, "notes");
    const zIndexBeforeRestore = state.byId.notes.zIndex;
    expect(state.byId.notes).toMatchObject({
      isOpen: true,
      isClosing: false,
      isMinimized: true,
    });
    expect(getActiveWindowId(state)).toBe("terminal");

    state = reduce(state, WINDOW_ACTIONS.TOGGLE, "notes");
    expect(state.byId.notes.isMinimized).toBe(false);
    expect(state.byId.notes.zIndex).toBeGreaterThan(zIndexBeforeRestore);
    expect(getActiveWindowId(state)).toBe("notes");
  });

  test("enters and exits fullscreen without changing the saved window order", () => {
    let state = createInitialWindowsState(registry, false);
    state = reduce(state, WINDOW_ACTIONS.OPEN, "notes");
    const zIndex = state.byId.notes.zIndex;

    state = reduce(state, WINDOW_ACTIONS.TOGGLE_FULLSCREEN, "notes");
    expect(state.byId.notes.isFullscreen).toBe(true);
    expect(state.byId.notes.zIndex).toBe(zIndex);

    state = reduce(state, WINDOW_ACTIONS.TOGGLE_FULLSCREEN, "notes");
    expect(state.byId.notes.isFullscreen).toBe(false);
    expect(state.byId.notes.zIndex).toBe(zIndex);
  });

  test("resets transient and fullscreen state when a window closes", () => {
    let state = createInitialWindowsState(registry, false);
    state = reduce(state, WINDOW_ACTIONS.OPEN, "notes");
    state = reduce(state, WINDOW_ACTIONS.TOGGLE_FULLSCREEN, "notes");
    state = reduce(state, WINDOW_ACTIONS.START_CLOSE, "notes");
    state = reduce(state, WINDOW_ACTIONS.FINISH_CLOSE, "notes");

    expect(state.byId.notes).toMatchObject({
      isOpen: false,
      isMinimized: false,
      isClosing: false,
      isFullscreen: false,
    });
    expect(getActiveWindowId(state)).toBeNull();
  });

  test("ignores actions targeting an unknown window", () => {
    const state = createInitialWindowsState(registry, true);

    expect(reduce(state, WINDOW_ACTIONS.OPEN, "missing")).toBe(state);
  });
});
