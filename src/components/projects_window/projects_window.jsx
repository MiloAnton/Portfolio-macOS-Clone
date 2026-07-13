import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import projectsList from "./../../ressources/listProjects.json";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import "./projects_window.scss";

export default function ProjectsWindow(props) {
  const [defaultWidth, defaultHeight] = props.defaultSize || [800, 600];
  const { position, handleDragStop } = usePersistentWindowPosition(
    "projects",
    defaultWidth,
    defaultHeight
  );
  const handleFullscreen = () => {
    props.fullScreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={
          props.isMinimized
            ? { display: "none" }
            : props.isFullScreen
            ? {
                width: "calc(100vw - 100px) !important",
                height: "100vh !important",
              }
            : { zIndex: props.zIndex }
        }
        onMouseDownCapture={() => props.handleClickZIndex()}
        width={defaultWidth} // Largeur initiale de la fenêtre
        height={defaultHeight} // Hauteur initiale de la fenêtre
        minConstraints={[300, 200]} // Largeur et hauteur minimales
        maxConstraints={[2560, 1440]} // Largeur et hauteur maximales
        resizeHandles={["se"]} // Redimensionner uniquement depuis le coin inférieur droit
      >
        <MenuBar
          title="Projets"
          handleFullscreen={handleFullscreen}
          handleQuit={handleQuit}
          handleMinimize={props.handleMinimize}
        />
        <section className="page projects-page">
          <div className="content">
            <section className="experience" id="projects">
              <header className="projects-header">
                <div>
                  <p className="eyebrow">Sélection de travaux</p>
                  <h2>Projets</h2>
                  <p className="intro">
                    Certains de mes projets terminés, parfois vendus, parfois offerts :)
                  </p>
                </div>
                <span className="project-count">
                  {projectsList.projects.length} projets
                </span>
              </header>
              <div className="card-container">
                {projectsList.projects.map((element, index) => {
                  return (
                    <div className="cardExperience" key={index}>
                      <div className="project-topline">
                        <span className="project-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="project-date">{element.when}</span>
                      </div>
                      <h3>{element.name}</h3>
                      <p className="project-role">{element.function}</p>
                      {element.description && (
                        <p className="project-description">
                          {element.description}
                        </p>
                      )}
                      <div className="project-footer">
                        <span className="project-company">{element.where}</span>
                        <div className="project-tags">
                          {element.languages.flatMap((language) =>
                            language.split(", ")
                          ).map((language) => (
                            <span key={language}>{language}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
