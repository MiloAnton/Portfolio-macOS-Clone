import React, {
  Suspense,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import Toolbar from "./components/toolbar/toolbar";
import WelcomeAnimation from "./components/intro_animation/WelcomeAnimation";
import Desktop from "./components/desktop/desktop";
import {
  WINDOW_REGISTRY,
  WINDOWS_BY_ID,
} from "./config/windowRegistry";
import {
  createInitialWindowsState,
  getActiveWindowId,
  WINDOW_ACTIONS,
  windowsReducer,
} from "./state/windowManager";
import { addPortfolioLog } from "./utils/portfolioLogger";

const WINDOW_ANIMATION_DURATION = 320;

export default function App() {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;
  const [isWelcomeAnimationVisible, setIsWelcomeAnimationVisible] =
    useState(true);
  const [windows, dispatch] = useReducer(
    windowsReducer,
    { registry: WINDOW_REGISTRY, isDesktop },
    ({ registry, isDesktop: desktop }) =>
      createInitialWindowsState(registry, desktop)
  );
  const transitionTimersRef = useRef(new Map());
  const previousWindowsRef = useRef(null);
  const previousFocusRef = useRef(null);
  const activeWindowId = getActiveWindowId(windows);
  const activeWindow = activeWindowId
    ? WINDOWS_BY_ID[activeWindowId]
    : null;

  useEffect(
    () => () => {
      transitionTimersRef.current.forEach((timer) => clearTimeout(timer));
      transitionTimersRef.current.clear();
    },
    []
  );

  const completeAfterAnimation = (id, type) => {
    clearTimeout(transitionTimersRef.current.get(id));
    const timer = setTimeout(() => {
      dispatch({ type, id });
      transitionTimersRef.current.delete(id);
    }, WINDOW_ANIMATION_DURATION);
    transitionTimersRef.current.set(id, timer);
  };

  const cancelScheduledTransition = (id) => {
    clearTimeout(transitionTimersRef.current.get(id));
    transitionTimersRef.current.delete(id);
  };

  const openWindow = (id) => {
    cancelScheduledTransition(id);
    dispatch({ type: WINDOW_ACTIONS.OPEN, id });
  };

  const toggleWindow = (id) => {
    cancelScheduledTransition(id);
    dispatch({ type: WINDOW_ACTIONS.TOGGLE, id });
  };

  const animateClose = (id) => {
    dispatch({ type: WINDOW_ACTIONS.START_CLOSE, id });
    completeAfterAnimation(id, WINDOW_ACTIONS.FINISH_CLOSE);
  };

  const animateMinimize = (id) => {
    const windowState = windows.byId[id];
    if (!windowState?.isOpen || windowState.isClosing || windowState.isMinimized) {
      return;
    }
    dispatch({ type: WINDOW_ACTIONS.START_MINIMIZE, id });
    completeAfterAnimation(id, WINDOW_ACTIONS.FINISH_MINIMIZE);
  };

  useEffect(() => {
    const snapshot = Object.fromEntries(
      WINDOW_REGISTRY.map(({ id }) => [id, {
        isOpen: windows.byId[id].isOpen,
        isMinimized: windows.byId[id].isMinimized,
      }])
    );

    if (previousWindowsRef.current === null) {
      addPortfolioLog("success", "system", "Session du portfolio initialisée");
      WINDOW_REGISTRY.filter(({ id }) => snapshot[id].isOpen).forEach(
        ({ id, label }) => addPortfolioLog("info", "window", `${label} ouverte`)
      );
    } else {
      WINDOW_REGISTRY.forEach(({ id, label }) => {
        const previous = previousWindowsRef.current[id];
        const current = snapshot[id];
        if (previous.isOpen !== current.isOpen) {
          addPortfolioLog(
            "info",
            "window",
            `${label} ${current.isOpen ? "ouverte" : "fermée"}`
          );
        } else if (previous.isMinimized !== current.isMinimized) {
          addPortfolioLog(
            "info",
            "window",
            `${label} ${current.isMinimized ? "minimisée dans le Dock" : "restaurée"}`
          );
        }
      });
    }
    previousWindowsRef.current = snapshot;
  }, [windows.byId]);

  useEffect(() => {
    if (
      activeWindowId &&
      previousFocusRef.current !== null &&
      previousFocusRef.current !== activeWindowId
    ) {
      addPortfolioLog("info", "focus", WINDOWS_BY_ID[activeWindowId].label);
    }
    previousFocusRef.current = activeWindowId;
  }, [activeWindowId]);

  return (
    <main className="bounds">
      {isWelcomeAnimationVisible && (
        <WelcomeAnimation
          onAnimationEnd={() => setIsWelcomeAnimationVisible(false)}
        />
      )}
      <Toolbar focusedWindow={activeWindow} />
      <Desktop
        openProjects={() => openWindow("projects")}
      />

      {WINDOW_REGISTRY.map((windowConfig) => {
        const windowState = windows.byId[windowConfig.id];
        if (!windowState.isOpen) return null;
        const WindowComponent = windowConfig.component;

        return (
          <div
            className={`window-container${
              windowState.isClosing ? " window-closing" : ""
            }${windowState.isMinimized ? " window-minimized" : ""}`}
            key={windowConfig.id}
          >
            <Suspense fallback={null}>
              <WindowComponent
                defaultSize={windowConfig.defaultSize}
                setDisplayed={() => toggleWindow(windowConfig.id)}
                zIndex={windowState.zIndex}
                handleClickZIndex={() =>
                  dispatch({ type: WINDOW_ACTIONS.FOCUS, id: windowConfig.id })
                }
                isFullScreen={windowState.isFullscreen}
                isMinimized={windowState.isMinimized}
                handleClose={() => animateClose(windowConfig.id)}
                handleMinimize={() => animateMinimize(windowConfig.id)}
                fullScreen={() =>
                  dispatch({
                    type: WINDOW_ACTIONS.TOGGLE_FULLSCREEN,
                    id: windowConfig.id,
                  })
                }
                isActive={activeWindowId === windowConfig.id}
              />
            </Suspense>
          </div>
        );
      })}

      <Dock
        windows={windows.byId}
        onToggle={toggleWindow}
      />
    </main>
  );
}
