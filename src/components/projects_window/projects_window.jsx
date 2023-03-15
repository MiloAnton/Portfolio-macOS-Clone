import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";

export default function ProjectsWindow(props) {
  return (
    <Draggable handle="#handle">
      <div
        className="App"
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={() => props.handleClickZIndex()}
      >
        <MenuBar />
        <section className="page">
          <div className="content">
            <h2 style={{ color: "white", textAlign: "center" }}>
              Projets (bientôt disponible)
            </h2>
            <p>
              Mes projets seront visibles sur <br/>cette fenêtre et seront consultables sur <br/>votre navigateur, ou à travers un navigateur interne.
            </p>
          </div>
        </section>
      </div>
    </Draggable>
  );
}
