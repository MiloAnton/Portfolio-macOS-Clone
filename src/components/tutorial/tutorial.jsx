import "./tutorial.scss";
import Draggable from "react-draggable";

export default function Tutorial(props) {
  const handleFullscreen = () => {
    props.fullscreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  return (
    <Draggable handle="#handle">
      <section
        className="tuto_container"
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
      >
        <div id="handle" style={{ cursor: "grab" }}>
          <div className="buttons">
            <div className="quitButton" onClick={() => handleQuit()} />
            <div className="minimizeButton" onClick={() => handleQuit()} />
            <div
              className="fullscreenButton"
              onClick={() => handleFullscreen()}
            />
          </div>
        </div>
        <div className="content">
          <h2>Bienvenue !</h2>
          <p>
            Vous pouvez utiliser ce site comme vous le feriez naturellement sur
            votre ordinateur, retrouvez dans cette fenêtre quelques informations de base sur son fonctionnement.
          </p>
          <p>
            <b>
              Pour fermer cette fenêtre, cliquez sur le bouton rouge en haut à
              gauche !
            </b>
          </p>
          <p>
            Les fonctionnalités actuellement implémentées sont les suivantes :
            <ul>
              <li>
                <b>Minimiser</b> : cliquez sur le bouton orange en haut à gauche
                pour réduire la fenêtre au minimum.
              </li>
              <li>
                <b>Redimensionner</b> : cliquez et déplacez le coin inférieur
                droit pour redimensionner la fenêtre.
              </li>
              <li>
                <b>Déplacer</b> : cliquez sur la barre supérieure de la fenêtre et déplacez là où vous le
                souhaitez.
              </li>
              <li>
                <b>Utilisation du Dock</b> : cliquez sur les icônes du Dock pour
                ouvrir ou fermer les fenêtres correspondantes.
              </li>
            </ul>
          </p>
        </div>
      </section>
    </Draggable>
  );
}
