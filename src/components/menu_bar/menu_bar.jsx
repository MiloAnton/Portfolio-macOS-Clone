import "./menu_bar.scss";
import version from "./../../../package.json";

export default function MenuBar() {
  return (
    <section className="menubar" id="handle" style={{ cursor:"grab" }}>
      <div className="buttons">
        <div className="quitButton" />
        <div className="minimizeButton" />
        <div className="fullscreenButton" />
      </div>
      <div className="version">
        <p className="versionNumber" title="Version du 09/03/2023">
          v{version.version}
        </p>
      </div>
    </section>
  );
}
