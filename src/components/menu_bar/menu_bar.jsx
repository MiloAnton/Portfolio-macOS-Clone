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
        <a
          href="https://github.com/MiloAnton/Portfolio"
          target="_blank"
          rel="noreferrer"
          title="Repository GitHub"
        >
          <img src={github} height="30px" alt="Logo de github" />
        </a>
        <p className="versionNumber" title="Version du 12/08/2023">
          v{version.version}
        </p>
      </div>
    </section>
  );
}
