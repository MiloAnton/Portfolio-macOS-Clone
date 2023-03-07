import "./menu_bar.scss";
import version from "./../../../package.json"

export default function MenuBar () {
    return (
        <section className="menubar">
            <div className="buttons">
                <div className="quitButton" />
                <div className="minimizeButton" />
                <div className="fullscreenButton" />
            </div>
            <div className="version">
                <p className="versionNumber">v{version.version}</p>
                <p style={{ fontSize: "13px" }}>(07/03/2023)</p>
            </div>
        </section>
    )
}