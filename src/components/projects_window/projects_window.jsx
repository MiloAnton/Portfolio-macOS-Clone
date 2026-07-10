import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import projectsList from "./../../ressources/listProjects.json";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";

export default function ProjectsWindow(props) {
  const { position, handleDragStop } = usePersistentWindowPosition(
    "projects",
    800,
    600
  );
  const handleFullscreen = () => {
    props.fullscreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className="App"
        style={
          props.isMinimized
            ? { display: "none" }
            : props.isFullscreen
            ? {
                width: "calc(100vw - 100px) !important",
                height: "100vh !important",
              }
            : { zIndex: props.zIndex }
        }
        onMouseDownCapture={() => props.handleClickZIndex()}
        width={800} // Largeur initiale de la fenêtre
        height={600} // Hauteur initiale de la fenêtre
        minConstraints={[300, 200]} // Largeur et hauteur minimales
        maxConstraints={[2560, 1440]} // Largeur et hauteur maximales
        resizeHandles={["se"]} // Redimensionner uniquement depuis le coin inférieur droit
      >
        <MenuBar handleFullscreen={handleFullscreen} handleQuit={handleQuit} />
        <section className="page">
          <div className="content">
            <section className="experience" id="projects">
              <h2>Projets</h2>
              <div className="card-container">
                {projectsList.projects.map((element, index) => {
                  return (
                    <div className="cardExperience" key={index}>
                      <div className="rowText">
                        <h4>{element.name}</h4>-<p>{element.when}</p>
                      </div>
                      <p>{element.function}</p>
                      <p>
                        {element.where} · {element.languages.join(" / ")}
                      </p>
                      {element.description && <p>{element.description}</p>}
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
