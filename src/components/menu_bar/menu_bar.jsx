import "./menu_bar.scss";
import version from "./../../../package.json";

export default function MenuBar(props) {
  return (
    <section className="menubar" id="handle" style={{ cursor: "grab" }}>
      <div className="buttons">
        <div className="quitButton" onClick={() => props.handleQuit()} />
        <div className="minimizeButton" onClick={() => props.handleQuit()} />
        <div
          className="fullscreenButton"
          onClick={() => props.handleFullscreen()}
        />
      </div>
      {props.title && <p className="window-title">{props.title}</p>}
      <div className="version">
        <p className="versionNumber" title="Version du 10/07/2026">
          v{version.version}
        </p>
      </div>
    </section>
  );
}
