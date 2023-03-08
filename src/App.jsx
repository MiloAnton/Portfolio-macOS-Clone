import { useState } from "react";
import "./App.scss";
import Dock from "./components/dock/dock";
import MainWindow from "./components/main_window/main_window";
import ProjectsWindow from "./components/projects_window/projects_window";
import LinksWindow from "./components/links_window/links_window";
import MenuBar from "./components/menu_bar/menu_bar";
import Toolbar from "./components/toolbar/toolbar";

export default function App() {
  const availableComponents = {MainWindow, ProjectsWindow, LinksWindow}
  const [displayedComponent, setDisplayedComponent] = useState("MainWindow")
  const DynamicComponent = availableComponents[displayedComponent]

  const handleSetCurriculum = () => {
    setDisplayedComponent("MainWindow")
  }

  const handleSetProjects = () => {
    setDisplayedComponent("ProjectsWindow")
  }

  const handleSetLinks = () => {
    setDisplayedComponent("LinksWindow")
  }

  return (
    <main>
      <Toolbar />
          <div className="App">
            <MenuBar />
            <DynamicComponent />
          </div>
      <Dock 
        setCurriculum={handleSetCurriculum}
        setProjects={handleSetProjects}
        setLinks={handleSetLinks}
      />
    </main>
  );
}
