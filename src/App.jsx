import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import Toolbar from "./components/toolbar/toolbar";
import WelcomeAnimation from "./components/intro_animation/WelcomeAnimation";
import Desktop from "./components/desktop/desktop";
import { addPortfolioLog } from "./utils/portfolioLogger";

// Chaque fenêtre est chargée à la demande (code-splitting) : le bundle
// initial ne contient que le bureau, le Dock et la barre de menus. Les
// petites images inlinées en base64 par CRA suivent dans le chunk de leur
// fenêtre au lieu de gonfler le bundle principal.
const MainWindow = lazy(() => import("./components/main_window/main_window"));
const ProjectsWindow = lazy(() => import("./components/projects_window/projects_window"));
const NotesWindow = lazy(() => import("./components/notes_window/notes_window"));
const FacetimeWindow = lazy(() => import("./components/facetime_window/facetime_window"));
const TerminalWindow = lazy(() => import("./components/terminal_window/terminal_window"));
const SafariWindow = lazy(() => import("./components/safari_window/safari_window"));
const MessagesWindow = lazy(() => import("./components/messages_window/messages_window"));
const CalculatorWindow = lazy(() => import("./components/calculator_window/calculator_window"));
const ConsoleWindow = lazy(() => import("./components/console_window/console_window"));
const GamesWindow = lazy(() => import("./components/games_window/games_window"));
const CalendarWindow = lazy(() => import("./components/calendar_window/calendar_window"));

// Libellés affichés dans la Console pour les événements de fenêtres.
const WINDOW_LABELS = {
  main: "Curriculum",
  projects: "Projets",
  notes: "Notes",
  facetime: "FaceTime",
  terminal: "Terminal",
  safari: "Safari",
  messages: "Messages",
  calculator: "Calculatrice",
  console: "Console",
  games: "Jeux",
  calendar: "Calendrier",
};

export default function App() {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;
  const [isWelcomeAnimationVisible, setIsWelcomeAnimationVisible] =
    useState(true);

  const handleAnimationEnd = () => {
    setIsWelcomeAnimationVisible(false);
  };

  const [displayedMainWindow, setDisplayedMainWindow] = useState(isDesktop);
  const [displayedProjectsWindow, setDisplayedProjectsWindow] = useState(false);
  const [displayedNotesWindow, setDisplayedNotesWindow] = useState(false);
  const [displayedFacetimeWindow, setDisplayedFacetimeWindow] = useState(false);
  const [displayedTerminalWindow, setDisplayedTerminalWindow] =
    useState(isDesktop);
  const [displayedSafariWindow, setDisplayedSafariWindow] = useState(false);
  const [displayedMessagesWindow, setDisplayedMessagesWindow] = useState(false);
  const [displayedCalculatorWindow, setDisplayedCalculatorWindow] =
    useState(false);
  const [displayedConsoleWindow, setDisplayedConsoleWindow] = useState(false);
  const [displayedGamesWindow, setDisplayedGamesWindow] = useState(false);
  const [displayedCalendarWindow, setDisplayedCalendarWindow] = useState(false);

  const [zIndexMainWindow, setZIndexMinWindow] = useState(1);
  const [zIndexProjectsWindow, setZIndexProjectsWindow] = useState(1);
  const [zIndexNotesWindow, setZIndexNotesWindow] = useState(1);
  const [zIndexFacetimeWindow, setZIndexFacetimeWindow] = useState(1);
  const [zIndexTerminalWindow, setZIndexTerminalWindow] = useState(2);
  const [zIndexSafariWindow, setZIndexSafariWindow] = useState(1);
  const [zIndexMessagesWindow, setZIndexMessagesWindow] = useState(1);
  const [zIndexCalculatorWindow, setZIndexCalculatorWindow] = useState(1);
  const [zIndexConsoleWindow, setZIndexConsoleWindow] = useState(1);
  const [zIndexGamesWindow, setZIndexGamesWindow] = useState(1);
  const [zIndexCalendarWindow, setZIndexCalendarWindow] = useState(1);
  const zIndexValues = {
    zIndexMainWindow: zIndexMainWindow,
    zIndexProjectsWindow: zIndexProjectsWindow,
    zIndexNotesWindow: zIndexNotesWindow,
    zIndexFacetimeWindow: zIndexFacetimeWindow,
    zIndexTerminalWindow: zIndexTerminalWindow,
    zIndexSafariWindow: zIndexSafariWindow,
    zIndexMessagesWindow: zIndexMessagesWindow,
    zIndexCalculatorWindow: zIndexCalculatorWindow,
    zIndexConsoleWindow: zIndexConsoleWindow,
    zIndexGamesWindow: zIndexGamesWindow,
    zIndexCalendarWindow: zIndexCalendarWindow,
  };
  const [maxZIndexVarName, setMaxZIndexVarName] = useState(
    isDesktop ? "zIndexTerminalWindow" : "zIndexMainWindow"
  );
  const maxZIndex = zIndexValues[maxZIndexVarName];

  const handleClickZIndexMainWindow = () => {
    setZIndexMinWindow(maxZIndex + 1);
  };

  const handleClickZIndexProjectsWindow = () => {
    setZIndexProjectsWindow(maxZIndex + 1);
  };

  const handleClickZIndexNotesWindow = () => {
    setZIndexNotesWindow(maxZIndex + 1);
  };

  const handleClickZIndexFacetimeWindow = () => {
    setZIndexFacetimeWindow(maxZIndex + 1);
  };

  const handleClickZIndexTerminalWindow = () => {
    setZIndexTerminalWindow(maxZIndex + 1);
  };

  const handleClickZIndexSafariWindow = () => {
    setZIndexSafariWindow(maxZIndex + 1);
  };

  const handleClickZIndexMessagesWindow = () => {
    setZIndexMessagesWindow(maxZIndex + 1);
  };

  const handleClickZIndexCalculatorWindow = () => {
    setZIndexCalculatorWindow(maxZIndex + 1);
  };

  const handleClickZIndexConsoleWindow = () => {
    setZIndexConsoleWindow(maxZIndex + 1);
  };
  const handleClickZIndexGamesWindow = () => {
    setZIndexGamesWindow(maxZIndex + 1);
  };
  const handleClickZIndexCalendarWindow = () => {
    setZIndexCalendarWindow(maxZIndex + 1);
  };

  // Fenêtres minimisées dans le Dock : elles restent montées (leur état
  // interne survit) mais sont masquées après l'animation genie.
  const [minimizedWindows, setMinimizedWindows] = useState([]);

  useEffect(() => {
    // Une fenêtre minimisée ne compte plus pour le focus : le titre de la
    // barre de menus et l'état actif passent à la fenêtre suivante.
    const currentZIndexes = {};
    if (displayedMainWindow && !minimizedWindows.includes("main")) currentZIndexes.zIndexMainWindow = zIndexMainWindow;
    if (displayedProjectsWindow && !minimizedWindows.includes("projects")) currentZIndexes.zIndexProjectsWindow = zIndexProjectsWindow;
    if (displayedNotesWindow && !minimizedWindows.includes("notes")) currentZIndexes.zIndexNotesWindow = zIndexNotesWindow;
    if (displayedFacetimeWindow && !minimizedWindows.includes("facetime")) currentZIndexes.zIndexFacetimeWindow = zIndexFacetimeWindow;
    if (displayedTerminalWindow && !minimizedWindows.includes("terminal")) currentZIndexes.zIndexTerminalWindow = zIndexTerminalWindow;
    if (displayedSafariWindow && !minimizedWindows.includes("safari")) currentZIndexes.zIndexSafariWindow = zIndexSafariWindow;
    if (displayedMessagesWindow && !minimizedWindows.includes("messages")) currentZIndexes.zIndexMessagesWindow = zIndexMessagesWindow;
    if (displayedCalculatorWindow && !minimizedWindows.includes("calculator")) currentZIndexes.zIndexCalculatorWindow = zIndexCalculatorWindow;
    if (displayedConsoleWindow && !minimizedWindows.includes("console")) currentZIndexes.zIndexConsoleWindow = zIndexConsoleWindow;
    if (displayedGamesWindow && !minimizedWindows.includes("games")) currentZIndexes.zIndexGamesWindow = zIndexGamesWindow;
    if (displayedCalendarWindow && !minimizedWindows.includes("calendar")) currentZIndexes.zIndexCalendarWindow = zIndexCalendarWindow;

    const displayedWindowNames = Object.keys(currentZIndexes);
    if (displayedWindowNames.length > 0) {
      setMaxZIndexVarName(
        displayedWindowNames.reduce((a, b) =>
          currentZIndexes[a] > currentZIndexes[b] ? a : b
        )
      );
    }
  }, [
    zIndexMainWindow,
    zIndexProjectsWindow,
    zIndexNotesWindow,
    zIndexFacetimeWindow,
    zIndexTerminalWindow,
    zIndexSafariWindow,
    zIndexMessagesWindow,
    zIndexCalculatorWindow,
    zIndexConsoleWindow,
    zIndexGamesWindow,
    zIndexCalendarWindow,
    displayedMainWindow,
    displayedProjectsWindow,
    displayedNotesWindow,
    displayedFacetimeWindow,
    displayedTerminalWindow,
    displayedSafariWindow,
    displayedMessagesWindow,
    displayedCalculatorWindow,
    displayedConsoleWindow,
    displayedGamesWindow,
    displayedCalendarWindow,
    minimizedWindows,
  ]);

  useEffect(() => {
    handleClickZIndexMainWindow();
    // eslint-disable-next-line
  }, [displayedMainWindow]);

  useEffect(() => {
    handleClickZIndexProjectsWindow();
    // eslint-disable-next-line
  }, [displayedProjectsWindow]);

  useEffect(() => {
    handleClickZIndexNotesWindow();
    // eslint-disable-next-line
  }, [displayedNotesWindow]);

  useEffect(() => {
    handleClickZIndexFacetimeWindow();
    // eslint-disable-next-line
  }, [displayedFacetimeWindow]);

  useEffect(() => {
    handleClickZIndexTerminalWindow();
    // eslint-disable-next-line
  }, [displayedTerminalWindow]);

  useEffect(() => {
    handleClickZIndexSafariWindow();
    // eslint-disable-next-line
  }, [displayedSafariWindow]);

  useEffect(() => {
    handleClickZIndexMessagesWindow();
    // eslint-disable-next-line
  }, [displayedMessagesWindow]);

  useEffect(() => {
    handleClickZIndexCalculatorWindow();
    // eslint-disable-next-line
  }, [displayedCalculatorWindow]);

  useEffect(() => {
    handleClickZIndexConsoleWindow();
    // eslint-disable-next-line
  }, [displayedConsoleWindow]);
  useEffect(() => {
    handleClickZIndexGamesWindow();
    // eslint-disable-next-line
  }, [displayedGamesWindow]);
  useEffect(() => {
    handleClickZIndexCalendarWindow();
    // eslint-disable-next-line
  }, [displayedCalendarWindow]);

  const handleSetCurriculum = () =>
    toggleWindow("main", displayedMainWindow, setDisplayedMainWindow, handleClickZIndexMainWindow);

  const handleSetProjects = () =>
    toggleWindow("projects", displayedProjectsWindow, setDisplayedProjectsWindow, handleClickZIndexProjectsWindow);

  const handleOpenProjects = () => {
    restoreWindow("projects");
    setDisplayedProjectsWindow(true);
    handleClickZIndexProjectsWindow();
  };

  const handleSetNotes = () =>
    toggleWindow("notes", displayedNotesWindow, setDisplayedNotesWindow, handleClickZIndexNotesWindow);

  const handleSetFacetime = () =>
    toggleWindow("facetime", displayedFacetimeWindow, setDisplayedFacetimeWindow, handleClickZIndexFacetimeWindow);

  const handleSetTerminal = () =>
    toggleWindow("terminal", displayedTerminalWindow, setDisplayedTerminalWindow, handleClickZIndexTerminalWindow);

  const handleSetSafari = () =>
    toggleWindow("safari", displayedSafariWindow, setDisplayedSafariWindow, handleClickZIndexSafariWindow);

  const handleSetMessages = () =>
    toggleWindow("messages", displayedMessagesWindow, setDisplayedMessagesWindow, handleClickZIndexMessagesWindow);

  const handleSetCalculator = () =>
    toggleWindow("calculator", displayedCalculatorWindow, setDisplayedCalculatorWindow, handleClickZIndexCalculatorWindow);

  const handleSetConsole = () =>
    toggleWindow("console", displayedConsoleWindow, setDisplayedConsoleWindow, handleClickZIndexConsoleWindow);
  const handleSetGames = () =>
    toggleWindow("games", displayedGamesWindow, setDisplayedGamesWindow, handleClickZIndexGamesWindow);
  const handleSetCalendar = () =>
    toggleWindow("calendar", displayedCalendarWindow, setDisplayedCalendarWindow, handleClickZIndexCalendarWindow);

  const [mainindowIsFullScreen, setMainWindowIsFullScreen] = useState(false);
  const [projectsWindowIsFullScreen, setProjectsWindowIsFullScreen] =
    useState(false);
  const [notesWindowIsFullScreen, setNotesWindowIsFullScreen] = useState(false);
  const [facetimeWindowIsFullScreen, setFacetimeWindowIsFullScreen] =
    useState(false);
  const [terminalWindowIsFullScreen, setTerminalWindowIsFullScreen] =
    useState(false);
  const [safariWindowIsFullScreen, setSafariWindowIsFullScreen] =
    useState(false);
  const [messagesWindowIsFullScreen, setMessagesWindowIsFullScreen] =
    useState(false);
  const [calculatorWindowIsFullScreen, setCalculatorWindowIsFullScreen] =
    useState(false);
  const [consoleWindowIsFullScreen, setConsoleWindowIsFullScreen] =
    useState(false);
  const [gamesWindowIsFullScreen, setGamesWindowIsFullScreen] = useState(false);
  const [calendarWindowIsFullScreen, setCalendarWindowIsFullScreen] =
    useState(false);
  const handleCloseMainWindow = () => {
    setDisplayedMainWindow(false);
    setMainWindowIsFullScreen(false);
  };
  const handleCloseProjectsWindow = () => {
    setDisplayedProjectsWindow(false);
    setProjectsWindowIsFullScreen(false);
  };
  const handleCloseNotesWindow = () => {
    setDisplayedNotesWindow(false);
    setNotesWindowIsFullScreen(false);
  };
  const handleCloseFacetimeWindow = () => {
    setDisplayedFacetimeWindow(false);
    setFacetimeWindowIsFullScreen(false);
  };
  const handleCloseTerminalWindow = () => {
    setDisplayedTerminalWindow(false);
    setTerminalWindowIsFullScreen(false);
  };
  const handleCloseSafariWindow = () => {
    setDisplayedSafariWindow(false);
    setSafariWindowIsFullScreen(false);
  };
  const handleCloseMessagesWindow = () => {
    setDisplayedMessagesWindow(false);
    setMessagesWindowIsFullScreen(false);
  };
  const handleCloseCalculatorWindow = () => {
    setDisplayedCalculatorWindow(false);
    setCalculatorWindowIsFullScreen(false);
  };
  const handleCloseConsoleWindow = () => {
    setDisplayedConsoleWindow(false);
    setConsoleWindowIsFullScreen(false);
  };
  const handleCloseGamesWindow = () => {
    setDisplayedGamesWindow(false);
    setGamesWindowIsFullScreen(false);
  };
  const handleCloseCalendarWindow = () => {
    setDisplayedCalendarWindow(false);
    setCalendarWindowIsFullScreen(false);
  };
  const handleFullScreenMainWindow = () => {
    setMainWindowIsFullScreen(!mainindowIsFullScreen);
  };
  const handleFullScreenProjectsWindow = () => {
    setProjectsWindowIsFullScreen(!projectsWindowIsFullScreen);
  };
  const handleFullScreenNotesWindow = () => {
    setNotesWindowIsFullScreen(!notesWindowIsFullScreen);
  };
  const handleFullScreenFacetimeWindow = () => {
    setFacetimeWindowIsFullScreen(!facetimeWindowIsFullScreen);
  };
  const handleFullScreenTerminalWindow = () => {
    setTerminalWindowIsFullScreen(!terminalWindowIsFullScreen);
  };
  const handleFullScreenSafariWindow = () => {
    setSafariWindowIsFullScreen(!safariWindowIsFullScreen);
  };
  const handleFullScreenMessagesWindow = () => {
    setMessagesWindowIsFullScreen(!messagesWindowIsFullScreen);
  };
  const handleFullScreenCalculatorWindow = () => {
    setCalculatorWindowIsFullScreen(!calculatorWindowIsFullScreen);
  };
  const handleFullScreenConsoleWindow = () => {
    setConsoleWindowIsFullScreen(!consoleWindowIsFullScreen);
  };
  const handleFullScreenGamesWindow = () => {
    setGamesWindowIsFullScreen(!gamesWindowIsFullScreen);
  };
  const handleFullScreenCalendarWindow = () => {
    setCalendarWindowIsFullScreen(!calendarWindowIsFullScreen);
  };

  // Fenêtres en cours d'animation "genie" : leur démontage est retardé le
  // temps de l'animation (durée alignée sur window-genie-out dans App.scss).
  const [closingWindows, setClosingWindows] = useState([]);
  const animateClose = (name, close) => {
    setClosingWindows((current) => [...current, name]);
    setTimeout(() => {
      close();
      setClosingWindows((current) => current.filter((item) => item !== name));
    }, 320);
  };

  const animateMinimize = (name) => {
    if (closingWindows.includes(name) || minimizedWindows.includes(name)) return;
    setClosingWindows((current) => [...current, name]);
    setTimeout(() => {
      setClosingWindows((current) => current.filter((item) => item !== name));
      setMinimizedWindows((current) => [...current, name]);
      addPortfolioLog("info", "window", `${WINDOW_LABELS[name]} minimisée dans le Dock`);
    }, 320);
  };
  const restoreWindow = (name) => {
    if (!minimizedWindows.includes(name)) return;
    setMinimizedWindows((current) => current.filter((item) => item !== name));
    addPortfolioLog("info", "window", `${WINDOW_LABELS[name]} restaurée`);
  };

  // Clic Dock : restaure la fenêtre si elle est minimisée, sinon ouvre/ferme.
  const toggleWindow = (name, isDisplayed, setDisplayed, focusWindow) => {
    if (minimizedWindows.includes(name)) {
      restoreWindow(name);
      focusWindow();
      return;
    }
    setDisplayed(!isDisplayed);
  };

  const previousWindowsRef = useRef(null);
  const previousFocusRef = useRef(null);
  useEffect(() => {
    const windows = {
      Curriculum: displayedMainWindow,
      Projets: displayedProjectsWindow,
      Notes: displayedNotesWindow,
      FaceTime: displayedFacetimeWindow,
      Terminal: displayedTerminalWindow,
      Safari: displayedSafariWindow,
      Messages: displayedMessagesWindow,
      Calculatrice: displayedCalculatorWindow,
      Console: displayedConsoleWindow,
      Jeux: displayedGamesWindow,
      Calendrier: displayedCalendarWindow,
    };

    if (previousWindowsRef.current === null) {
      addPortfolioLog("success", "system", "Session du portfolio initialisée");
      Object.entries(windows)
        .filter(([, isOpen]) => isOpen)
        .forEach(([name]) => addPortfolioLog("info", "window", `${name} ouverte`));
    } else {
      Object.entries(windows).forEach(([name, isOpen]) => {
        if (previousWindowsRef.current[name] !== isOpen) {
          addPortfolioLog(
            "info",
            "window",
            `${name} ${isOpen ? "ouverte" : "fermée"}`
          );
        }
      });
    }
    previousWindowsRef.current = windows;
  }, [
    displayedMainWindow,
    displayedProjectsWindow,
    displayedNotesWindow,
    displayedFacetimeWindow,
    displayedTerminalWindow,
    displayedSafariWindow,
    displayedMessagesWindow,
    displayedCalculatorWindow,
    displayedConsoleWindow,
    displayedGamesWindow,
    displayedCalendarWindow,
  ]);

  useEffect(() => {
    if (
      previousFocusRef.current !== null &&
      previousFocusRef.current !== maxZIndexVarName
    ) {
      addPortfolioLog(
        "info",
        "focus",
        maxZIndexVarName.replace("zIndex", "").replace("Window", "")
      );
    }
    previousFocusRef.current = maxZIndexVarName;
  }, [maxZIndexVarName]);

  return (
      <main className="bounds">
        {isWelcomeAnimationVisible && (
          <WelcomeAnimation onAnimationEnd={handleAnimationEnd} />
        )}
        <Toolbar focusedWindow={maxZIndexVarName} />
        <Desktop openProjects={handleOpenProjects} />
        {[
          {
            component: (
              <MainWindow
                setDisplayed={handleSetCurriculum}
                zIndex={zIndexMainWindow}
                handleClickZIndex={handleClickZIndexMainWindow}
                isFullScreen={mainindowIsFullScreen}
                handleClose={() => animateClose("main", handleCloseMainWindow)}
                handleMinimize={() => animateMinimize("main")}
                fullScreen={handleFullScreenMainWindow}
                isActive={maxZIndexVarName === "zIndexMainWindow"}
              />
            ),
            name: "main",
            displayed: displayedMainWindow,
          },
          {
            component: (
              <ProjectsWindow
                setDisplayed={handleSetProjects}
                zIndex={zIndexProjectsWindow}
                handleClickZIndex={handleClickZIndexProjectsWindow}
                isFullScreen={projectsWindowIsFullScreen}
                handleClose={() => animateClose("projects", handleCloseProjectsWindow)}
                handleMinimize={() => animateMinimize("projects")}
                fullScreen={handleFullScreenProjectsWindow}
                isActive={maxZIndexVarName === "zIndexProjectsWindow"}
              />
            ),
            name: "projects",
            displayed: displayedProjectsWindow,
          },
          {
            component: (
              <NotesWindow
                setDisplayed={handleSetNotes}
                zIndex={zIndexNotesWindow}
                handleClickZIndex={handleClickZIndexNotesWindow}
                isFullScreen={notesWindowIsFullScreen}
                handleClose={() => animateClose("notes", handleCloseNotesWindow)}
                handleMinimize={() => animateMinimize("notes")}
                fullScreen={handleFullScreenNotesWindow}
                isActive={maxZIndexVarName === "zIndexNotesWindow"}
              />
            ),
            name: "notes",
            displayed: displayedNotesWindow,
          },
          {
            component: (
              <FacetimeWindow
                setDisplayed={handleSetFacetime}
                zIndex={zIndexFacetimeWindow}
                handleClickZIndex={handleClickZIndexFacetimeWindow}
                isFullScreen={facetimeWindowIsFullScreen}
                handleClose={() => animateClose("facetime", handleCloseFacetimeWindow)}
                handleMinimize={() => animateMinimize("facetime")}
                fullScreen={handleFullScreenFacetimeWindow}
                isActive={maxZIndexVarName === "zIndexFacetimeWindow"}
              />
            ),
            name: "facetime",
            displayed: displayedFacetimeWindow,
          },
          {
            component: (
              <TerminalWindow
                setDisplayed={handleSetTerminal}
                zIndex={zIndexTerminalWindow}
                handleClickZIndex={handleClickZIndexTerminalWindow}
                isFullScreen={terminalWindowIsFullScreen}
                handleClose={() => animateClose("terminal", handleCloseTerminalWindow)}
                handleMinimize={() => animateMinimize("terminal")}
                fullScreen={handleFullScreenTerminalWindow}
                isActive={maxZIndexVarName === "zIndexTerminalWindow"}
              />
            ),
            name: "terminal",
            displayed: displayedTerminalWindow,
          },
          {
            component: (
              <SafariWindow
                setDisplayed={handleSetSafari}
                zIndex={zIndexSafariWindow}
                handleClickZIndex={handleClickZIndexSafariWindow}
                isFullScreen={safariWindowIsFullScreen}
                handleClose={() => animateClose("safari", handleCloseSafariWindow)}
                handleMinimize={() => animateMinimize("safari")}
                fullScreen={handleFullScreenSafariWindow}
                isActive={maxZIndexVarName === "zIndexSafariWindow"}
              />
            ),
            name: "safari",
            displayed: displayedSafariWindow,
          },
          {
            component: (
              <MessagesWindow
                zIndex={zIndexMessagesWindow}
                handleClickZIndex={handleClickZIndexMessagesWindow}
                isFullScreen={messagesWindowIsFullScreen}
                handleClose={() => animateClose("messages", handleCloseMessagesWindow)}
                handleMinimize={() => animateMinimize("messages")}
                fullScreen={handleFullScreenMessagesWindow}
                isActive={maxZIndexVarName === "zIndexMessagesWindow"}
              />
            ),
            name: "messages",
            displayed: displayedMessagesWindow,
          },
          {
            component: (
              <CalculatorWindow
                zIndex={zIndexCalculatorWindow}
                handleClickZIndex={handleClickZIndexCalculatorWindow}
                isFullScreen={calculatorWindowIsFullScreen}
                handleClose={() => animateClose("calculator", handleCloseCalculatorWindow)}
                handleMinimize={() => animateMinimize("calculator")}
                fullScreen={handleFullScreenCalculatorWindow}
                isActive={maxZIndexVarName === "zIndexCalculatorWindow"}
              />
            ),
            name: "calculator",
            displayed: displayedCalculatorWindow,
          },
          {
            component: (
              <ConsoleWindow
                zIndex={zIndexConsoleWindow}
                handleClickZIndex={handleClickZIndexConsoleWindow}
                isFullScreen={consoleWindowIsFullScreen}
                handleClose={() => animateClose("console", handleCloseConsoleWindow)}
                handleMinimize={() => animateMinimize("console")}
                fullScreen={handleFullScreenConsoleWindow}
                isActive={maxZIndexVarName === "zIndexConsoleWindow"}
              />
            ),
            name: "console",
            displayed: displayedConsoleWindow,
          },
          {
            component: (
              <GamesWindow
                zIndex={zIndexGamesWindow}
                handleClickZIndex={handleClickZIndexGamesWindow}
                isFullScreen={gamesWindowIsFullScreen}
                handleClose={() => animateClose("games", handleCloseGamesWindow)}
                handleMinimize={() => animateMinimize("games")}
                fullScreen={handleFullScreenGamesWindow}
                isActive={maxZIndexVarName === "zIndexGamesWindow"}
              />
            ),
            name: "games",
            displayed: displayedGamesWindow,
          },
          {
            component: (
              <CalendarWindow
                zIndex={zIndexCalendarWindow}
                handleClickZIndex={handleClickZIndexCalendarWindow}
                isFullScreen={calendarWindowIsFullScreen}
                handleClose={() => animateClose("calendar", handleCloseCalendarWindow)}
                handleMinimize={() => animateMinimize("calendar")}
                fullScreen={handleFullScreenCalendarWindow}
                isActive={maxZIndexVarName === "zIndexCalendarWindow"}
              />
            ),
            name: "calendar",
            displayed: displayedCalendarWindow,
          },
        ]
          .filter((item) => item.displayed)
          .map((item) => (
            <div
              className={`window-container${
                closingWindows.includes(item.name) ? " window-closing" : ""
              }${minimizedWindows.includes(item.name) ? " window-minimized" : ""}`}
              key={item.name}
            >
              {/* Un Suspense PAR fenêtre : un boundary global masquerait
                  toutes les fenêtres ouvertes pendant le chargement d'un
                  nouveau chunk. */}
              <Suspense fallback={null}>{item.component}</Suspense>
            </div>
          ))}
        <Dock
          setCurriculum={handleSetCurriculum}
          setProjects={handleSetProjects}
          setNotes={handleSetNotes}
          setFacetime={handleSetFacetime}
          setTerminal={handleSetTerminal}
          setSafari={handleSetSafari}
          setMessages={handleSetMessages}
          setCalculator={handleSetCalculator}
          setConsole={handleSetConsole}
          setGames={handleSetGames}
          setCalendar={handleSetCalendar}
          openApps={{
            curriculum: displayedMainWindow,
            projects: displayedProjectsWindow,
            safari: displayedSafariWindow,
            messages: displayedMessagesWindow,
            facetime: displayedFacetimeWindow,
            calendar: displayedCalendarWindow,
            notes: displayedNotesWindow,
            terminal: displayedTerminalWindow,
            calculator: displayedCalculatorWindow,
            console: displayedConsoleWindow,
            games: displayedGamesWindow,
          }}
        />
      </main>
  );
}
