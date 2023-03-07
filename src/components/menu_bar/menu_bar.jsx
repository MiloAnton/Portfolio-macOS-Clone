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
            <p className="versionNumber">v{version.version}</p>
        </section>
    )
}