import React, { useEffect, useState } from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import MainWindow from "./components/main_window/main_window";
import ProjectsWindow from "./components/projects_window/projects_window";
import NotesWindow from "./components/notes_window/notes_window";
import FacetimeWindow from "./components/facetime_window/facetime_window";
import TerminalWindow from "./components/terminal_window/terminal_window";
import SafariWindow from "./components/safari_window/safari_window";
import Toolbar from "./components/toolbar/toolbar";
import WelcomeAnimation from "./components/intro_animation/WelcomeAnimation";
import LoginPage from "./components/login_page/loginPage";

export default function App() {
  const [isWelcomeAnimationVisible, setIsWelcomeAnimationVisible] =
    useState(true);

  const handleAnimationEnd = () => {
    setIsWelcomeAnimationVisible(false);
  };

  const [displayedMainWindow, setDisplayedMainWindow] = useState(true);
  const [displayedProjectsWindow, setDisplayedProjectsWindow] = useState(false);
  const [displayedNotesWindow, setDisplayedNotesWindow] = useState(false);
  const [displayedFacetimeWindow, setDisplayedFacetimeWindow] = useState(false);
  const [displayedTerminalWindow, setDisplayedTerminalWindow] = useState(false);
  const [displayedSafariWindow, setDisplayedSafariWindow] = useState(false);

  const [zIndexMainWindow, setZIndexMinWindow] = useState(1);
  const [zIndexProjectsWindow, setZIndexProjectsWindow] = useState(1);
  const [zIndexNotesWindow, setZIndexNotesWindow] = useState(1);
  const [zIndexFacetimeWindow, setZIndexFacetimeWindow] = useState(1);
  const [zIndexTerminalWindow, setZIndexTerminalWindow] = useState(1);
  const [zIndexSafariWindow, setZIndexSafariWindow] = useState(1);
  const zIndexValues = {
    zIndexMainWindow: zIndexMainWindow,
    zIndexProjectsWindow: zIndexProjectsWindow,
    zIndexNotesWindow: zIndexNotesWindow,
    zIndexFacetimeWindow: zIndexFacetimeWindow,
    zIndexTerminalWindow: zIndexTerminalWindow,
    zIndexSafariWindow: zIndexSafariWindow,
  };
  const [maxZIndexVarName, setMaxZIndexVarName] = useState("zIndexMainWindow");
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

  useEffect(() => {
    const currentZIndexes = {
      zIndexMainWindow,
      zIndexProjectsWindow,
      zIndexNotesWindow,
      zIndexFacetimeWindow,
      zIndexTerminalWindow,
      zIndexSafariWindow,
    };
    setMaxZIndexVarName(
      Object.keys(currentZIndexes).reduce((a, b) =>
        currentZIndexes[a] >= currentZIndexes[b] ? a : b
      )
    );
  }, [
    zIndexMainWindow,
    zIndexProjectsWindow,
    zIndexNotesWindow,
    zIndexFacetimeWindow,
    zIndexTerminalWindow,
    zIndexSafariWindow,
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

  const handleSetCurriculum = () => {
    setDisplayedMainWindow(!displayedMainWindow);
  };

  const handleSetProjects = () => {
    setDisplayedProjectsWindow(!displayedProjectsWindow);
  };

  const handleSetNotes = () => {
    setDisplayedNotesWindow(!displayedNotesWindow);
  };

  const handleSetFacetime = () => {
    setDisplayedFacetimeWindow(!displayedFacetimeWindow);
  };

  const handleSetTerminal = () => {
    setDisplayedTerminalWindow(!displayedTerminalWindow);
  };

  const handleSetSafari = () => {
    setDisplayedSafariWindow(!displayedSafariWindow);
  };

  const [LoggedIn, setLoggedIn] = useState(false);
  const handleLogIn = () => {
    setLoggedIn(!LoggedIn);
  };

  const [mainWindowIsMinimized, setMainWindowIsMinimized] = useState(false);
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
  const handleMinimizeMainWindow = () => {
    setMainWindowIsMinimized(!mainWindowIsMinimized);
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

  if (LoggedIn === false) {
    return <LoginPage Login={handleLogIn} />;
  } else {
    return (
      <main className="bounds">
        {isWelcomeAnimationVisible && (
          <WelcomeAnimation onAnimationEnd={handleAnimationEnd} />
        )}
        <Toolbar focusedWindow={maxZIndexVarName} Login={handleLogIn} />
        {[
          {
            component: (
              <MainWindow
                setDisplayed={handleSetCurriculum}
                zIndex={zIndexMainWindow}
                handleClickZIndex={handleClickZIndexMainWindow}
                isMinimized={mainWindowIsMinimized}
                isFullScreen={mainindowIsFullScreen}
                handleClose={handleCloseMainWindow}
                minimize={handleMinimizeMainWindow}
                fullScreen={handleFullScreenMainWindow}
              />
            ),
            displayed: displayedMainWindow,
          },
          {
            component: (
              <ProjectsWindow
                setDisplayed={handleSetProjects}
                zIndex={zIndexProjectsWindow}
                handleClickZIndex={handleClickZIndexProjectsWindow}
                isFullScreen={projectsWindowIsFullScreen}
                handleClose={handleCloseProjectsWindow}
                fullScreen={handleFullScreenProjectsWindow}
              />
            ),
            displayed: displayedProjectsWindow,
          },
          {
            component: (
              <NotesWindow
                setDisplayed={handleSetNotes}
                zIndex={zIndexNotesWindow}
                handleClickZIndex={handleClickZIndexNotesWindow}
                isFullScreen={notesWindowIsFullScreen}
                handleClose={handleCloseNotesWindow}
                fullScreen={handleFullScreenNotesWindow}
              />
            ),
            displayed: displayedNotesWindow,
          },
          {
            component: (
              <FacetimeWindow
                setDisplayed={handleSetFacetime}
                zIndex={zIndexFacetimeWindow}
                handleClickZIndex={handleClickZIndexFacetimeWindow}
                isFullScreen={facetimeWindowIsFullScreen}
                handleClose={handleCloseFacetimeWindow}
                fullScreen={handleFullScreenFacetimeWindow}
              />
            ),
            displayed: displayedFacetimeWindow,
          },
          {
            component: (
              <TerminalWindow
                setDisplayed={handleSetTerminal}
                zIndex={zIndexTerminalWindow}
                handleClickZIndex={handleClickZIndexTerminalWindow}
                isFullScreen={terminalWindowIsFullScreen}
                handleClose={handleCloseTerminalWindow}
                fullScreen={handleFullScreenTerminalWindow}
              />
            ),
            displayed: displayedTerminalWindow,
          },
          {
            component: (
              <SafariWindow
                setDisplayed={handleSetSafari}
                zIndex={zIndexSafariWindow}
                handleClickZIndex={handleClickZIndexSafariWindow}
                isFullScreen={safariWindowIsFullScreen}
                handleClose={handleCloseSafariWindow}
                fullScreen={handleFullScreenSafariWindow}
              />
            ),
            displayed: displayedSafariWindow,
          },
        ]
          .filter((item) => item.displayed)
          .map((item, index) => (
            <div className="window-container" key={index}>
              {item.component}
            </div>
          ))}
        <Dock
          setCurriculum={handleSetCurriculum}
          setProjects={handleSetProjects}
          setNotes={handleSetNotes}
          setFacetime={handleSetFacetime}
          setTerminal={handleSetTerminal}
          setSafari={handleSetSafari}
        />
      </main>
    );
  }
}
