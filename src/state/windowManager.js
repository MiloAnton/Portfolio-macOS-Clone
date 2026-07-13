export const WINDOW_ACTIONS = Object.freeze({
  OPEN: "window/open",
  TOGGLE: "window/toggle",
  FOCUS: "window/focus",
  START_CLOSE: "window/start-close",
  FINISH_CLOSE: "window/finish-close",
  START_MINIMIZE: "window/start-minimize",
  FINISH_MINIMIZE: "window/finish-minimize",
  TOGGLE_FULLSCREEN: "window/toggle-fullscreen",
});

export const createInitialWindowsState = (registry, isDesktop) => {
  const byId = Object.fromEntries(
    registry.map((config) => [
      config.id,
      {
        isOpen: Boolean(isDesktop && config.openOnDesktop),
        isMinimized: false,
        isClosing: false,
        isFullscreen: false,
        zIndex: config.initialZIndex || 1,
      },
    ])
  );
  const highestInitialZIndex = Math.max(
    0,
    ...Object.values(byId).map((windowState) => windowState.zIndex)
  );

  return { byId, nextZIndex: highestInitialZIndex + 1 };
};

const updateWindow = (state, id, update) => {
  const currentWindow = state.byId[id];
  if (!currentWindow) return state;
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: { ...currentWindow, ...update },
    },
  };
};

const bringToFront = (state, id, update = {}) => {
  const nextState = updateWindow(state, id, {
    ...update,
    zIndex: state.nextZIndex,
  });
  if (nextState === state) return state;
  return { ...nextState, nextZIndex: state.nextZIndex + 1 };
};

const closeWindow = (state, id) =>
  updateWindow(state, id, {
    isOpen: false,
    isMinimized: false,
    isClosing: false,
    isFullscreen: false,
  });

export const windowsReducer = (state, action) => {
  const currentWindow = state.byId[action.id];
  if (!currentWindow) return state;

  switch (action.type) {
    case WINDOW_ACTIONS.OPEN:
      return bringToFront(state, action.id, {
        isOpen: true,
        isMinimized: false,
        isClosing: false,
      });
    case WINDOW_ACTIONS.TOGGLE:
      if (currentWindow.isMinimized) {
        return bringToFront(state, action.id, {
          isMinimized: false,
          isClosing: false,
        });
      }
      return currentWindow.isOpen
        ? closeWindow(state, action.id)
        : bringToFront(state, action.id, { isOpen: true });
    case WINDOW_ACTIONS.FOCUS:
      if (!currentWindow.isOpen || currentWindow.isMinimized) return state;
      return bringToFront(state, action.id);
    case WINDOW_ACTIONS.START_CLOSE:
    case WINDOW_ACTIONS.START_MINIMIZE:
      if (!currentWindow.isOpen || currentWindow.isClosing) return state;
      return updateWindow(state, action.id, { isClosing: true });
    case WINDOW_ACTIONS.FINISH_CLOSE:
      return currentWindow.isOpen ? closeWindow(state, action.id) : state;
    case WINDOW_ACTIONS.FINISH_MINIMIZE:
      return currentWindow.isOpen
        ? updateWindow(state, action.id, {
            isClosing: false,
            isMinimized: true,
          })
        : state;
    case WINDOW_ACTIONS.TOGGLE_FULLSCREEN:
      return updateWindow(state, action.id, {
        isFullscreen: !currentWindow.isFullscreen,
      });
    default:
      return state;
  }
};

export const getActiveWindowId = (state) =>
  Object.entries(state.byId).reduce((activeId, [id, windowState]) => {
    if (!windowState.isOpen || windowState.isMinimized) return activeId;
    if (!activeId || windowState.zIndex > state.byId[activeId].zIndex) return id;
    return activeId;
  }, null);
