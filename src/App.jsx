import React, { useEffect, useState } from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import MainWindow from "./components/main_window/main_window";
import ProjectsWindow from "./components/projects_window/projects_window";
import Toolbar from "./components/toolbar/toolbar";
import Tutorial from "./components/tutorial/tutorial";

export default function App() {
  const [displayedTutorial, setDisplayedTutorial] = useState(true);
  const [displayedMainWindow, setDisplayedMainWindow] = useState(true);
  const [displayedProjectsWindow, setDisplayedProjectsWindow] = useState(false);

  const [zIndexMainWindow, setZIndexMinWindow] = useState(1);
  const [zIndexProjectsWindow, setZIndexProjectsWindow] = useState(1);
  const [zIndexTutorial, setZIndexTutorial] = useState(1);
  const zIndexValues = {
    zIndexMainWindow: zIndexMainWindow,
    zIndexProjectsWindow: zIndexProjectsWindow,
    zIndexTutorial: zIndexTutorial,
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

  useEffect(() => {
    if (
      zIndexMainWindow >= zIndexProjectsWindow &&
      zIndexMainWindow >= zIndexTutorial
    ) {
      setMaxZIndexVarName("zIndexMainWindow");
    } else if (
      zIndexProjectsWindow >= zIndexTutorial
    ) {
      setMaxZIndexVarName("zIndexProjectsWindow");
    } else {
      setMaxZIndexVarName("zIndexTutorial");
    }
  }, [
    zIndexMainWindow,
    zIndexProjectsWindow,
    zIndexTutorial,
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

  return (
    <main className="bounds">
      <Toolbar focusedWindow={maxZIndexVarName} />
      {[
        {
          component: (
            <MainWindow
              setDisplayed={handleSetCurriculum}
              zIndex={zIndexMainWindow}
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
      ]
        .filter((item) => item.displayed)
        .map((item, index) => (
          <React.Fragment key={index}>{item.component}</React.Fragment>
        ))}
      <Dock
        setCurriculum={handleSetCurriculum}
        setProjects={handleSetProjects}
        setTutorial={handleSetDisplayTutorial}
      />
    </main>
  );
}
