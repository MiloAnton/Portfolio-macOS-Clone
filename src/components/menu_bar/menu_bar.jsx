import "./menu_bar.scss";
import version from "./../../../package.json";
import github from "./../../assets/github.png";

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
      <div className="version">
        <p className="versionNumber" title="Version du 10/07/2026">
          v{version.version}
        </p>
      </div>
    </section>
  );
}
