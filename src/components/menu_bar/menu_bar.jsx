import "./menu_bar.scss";
import version from "./../../../package.json";

export default function MenuBar(props) {
  return (
    <section
      className="menubar window-handle"
      onDoubleClick={(event) => {
        if (!event.target.closest(".window-controls")) props.onDoubleClick();
      }}
    >
      <div className="buttons window-controls">
        <button
          className="quitButton"
          type="button"
          aria-label="Fermer la fenêtre"
          onClick={props.handleQuit}
        />
        <button
          className="minimizeButton"
          type="button"
          aria-label="Réduire la fenêtre"
          onClick={props.handleMinimize || props.handleQuit}
        />
        <button
          className="fullscreenButton"
          type="button"
          aria-label={
            props.isFullscreen
              ? "Quitter le plein écran"
              : "Afficher la fenêtre en plein écran"
          }
          onClick={props.handleFullscreen}
        />
      </div>
      {props.title && <p className="window-title">{props.title}</p>}
      <div className="version">
        <p className="versionNumber" title="Version du 13/07/2026">
          v{version.version}
        </p>
      </div>
    </section>
  );
}
