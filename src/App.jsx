import React, { useEffect, useState } from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import MainWindow from "./components/main_window/main_window";
import ProjectsWindow from "./components/projects_window/projects_window";
import Toolbar from "./components/toolbar/toolbar";
import Tutorial from "./components/tutorial/tutorial";
import WelcomeAnimation from "./components/intro_animation/WelcomeAnimation";
import InternalBrowser from "./components/internal_browser/InternalBrowser";
import LoginPage from "./components/login_page/loginPage";

export default function App() {
  const [isWelcomeAnimationVisible, setIsWelcomeAnimationVisible] =
    useState(true);

  const handleAnimationEnd = () => {
    setIsWelcomeAnimationVisible(false);
  };

  const [displayedTutorial, setDisplayedTutorial] = useState(true);
  const [displayedMainWindow, setDisplayedMainWindow] = useState(true);
  const [displayedProjectsWindow, setDisplayedProjectsWindow] = useState(false);
  const [displayedSafari, setDisplayedSafari] = useState(false);

  const [zIndexMainWindow, setZIndexMinWindow] = useState(1);
  const [zIndexProjectsWindow, setZIndexProjectsWindow] = useState(1);
  const [zIndexTutorial, setZIndexTutorial] = useState(1);
  const [zIndexSafari, setZIndexSafari] = useState(1);
  const zIndexValues = {
    zIndexMainWindow: zIndexMainWindow,
    zIndexProjectsWindow: zIndexProjectsWindow,
    zIndexTutorial: zIndexTutorial,
    zIndexSafari: zIndexSafari,
  };
  const [maxZIndexVarName, setMaxZIndexVarName] = useState("zIndexMainWindow");
  const maxZIndex = zIndexValues[maxZIndexVarName];

  const handleClickZIndexMainWindow = () => {
    setZIndexMinWindow(maxZIndex + 1);
  };

  const handleClickZIndexProjectsWindow = () => {
    setZIndexProjectsWindow(maxZIndex + 1);
  };

  const handleClickZIndexTutorial = () => {
    setZIndexTutorial(maxZIndex + 1);
  };

  const handleClickZIndexSafari = () => {
    setZIndexSafari(maxZIndex + 1);
  };

  useEffect(() => {
    if (
      zIndexMainWindow >= zIndexProjectsWindow &&
      zIndexMainWindow >= zIndexSafari &&
      zIndexMainWindow >= zIndexTutorial
    ) {
      setMaxZIndexVarName("zIndexMainWindow");
    } else if (
      zIndexProjectsWindow >= zIndexSafari &&
      zIndexProjectsWindow >= zIndexTutorial
    ) {
      setMaxZIndexVarName("zIndexProjectsWindow");
    } else if (zIndexSafari >= zIndexTutorial) {
      setMaxZIndexVarName("zIndexSafari");
    } else {
      setMaxZIndexVarName("zIndexTutorial");
    }
  }, [zIndexMainWindow, zIndexProjectsWindow, zIndexSafari, zIndexTutorial]);

  useEffect(() => {
    handleClickZIndexMainWindow();
    // eslint-disable-next-line
  }, [displayedMainWindow]);

  useEffect(() => {
    handleClickZIndexProjectsWindow();
    // eslint-disable-next-line
  }, [displayedProjectsWindow]);

  useEffect(() => {
    handleClickZIndexTutorial();
    // eslint-disable-next-line
  }, [displayedTutorial]);

  const handleSetCurriculum = () => {
    setDisplayedMainWindow(!displayedMainWindow);
  };

  const handleSetProjects = () => {
    setDisplayedProjectsWindow(!displayedProjectsWindow);
  };

  const handleSetDisplayTutorial = () => {
    setDisplayedTutorial(!displayedTutorial);
  };

  const handleSetDisplaySafari = () => {
    setDisplayedSafari(!displayedSafari);
    handleClickZIndexSafari();
  };

  const [LoggedIn, setLoggedIn] = useState(false);
  const handleLogIn = () => {
    setLoggedIn(!LoggedIn);
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
                handle="#handle"
                handleClickZIndex={handleClickZIndexMainWindow}
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
              />
            ),
            displayed: displayedProjectsWindow,
          },
          {
            component: (
              <Tutorial
                setDisplayed={handleSetDisplayTutorial}
                zIndex={zIndexTutorial}
                handleClickZIndex={handleClickZIndexTutorial}
              />
            ),
            displayed: displayedTutorial,
          },
          {
            component: (
              <InternalBrowser
                setDisplayed={handleSetDisplaySafari}
                zIndex={zIndexSafari}
                handleClickZIndex={handleClickZIndexSafari}
              />
            ),
            displayed: displayedSafari,
          },
        ]
          .filter((item) => item.displayed)
          .map((item, index) => (
            <React.Fragment key={index}>{item.component}</React.Fragment>
          ))}
        <Dock
          setCurriculum={handleSetCurriculum}
          setProjects={handleSetProjects}
          setTutorial={handleSetDisplayTutorial}
          setSafari={handleSetDisplaySafari}
        />
      </main>
    );
  }
}
