import "./toolbar.scss";
import heart from "./../../assets/heart.svg";
import CircumIcon from "@klarr-agency/circum-icons-react";

export default function Toolbar(props) {
  const current = new Date();
  const date = `${current.getDate()}/${
    current.getMonth() + 1
  }/${current.getFullYear()}`;

  return (
    <section className="toolbar">
      <div className="menus">
        <img
          src={heart}
          height="20px"
          title="Développé avec amour par Milo Anton Roche-Vandenbroucque"
          alt="Icône de coeur"
        />
        <a href="#perso" title="Scroll vers la présentation">
          <p>
            <b>Milo</b>
          </p>
        </a>
        {props.focusedWindow === "zIndexMainWindow" ? (
          <>
            <a href="#stack" title="Scroll vers ma stack technique">
              <p>Stack</p>
            </a>
            <a href="#pro" title="Scroll vers mes expériences">
              <p>Pro</p>
            </a>
            <a href="#education" title="Scroll vers mes diplômes">
              <p>Formation</p>
            </a>
          </>
        ) : props.focusedWindow === "zIndexProjectsWindow" ? (
          <a href="#projects" title="Scroll vers mes projets">
            <p>Projets</p>
          </a>
        ) : null}
      </div>
      <div className="icons">
        <div title="Super le cloud">
          <CircumIcon name="cloud_on" />
        </div>
        <div title="Bluetooth enabled">
          <CircumIcon name="bluetooth" />
        </div>
        <div title="Battery : 95%">
          <CircumIcon name="battery_full" />
        </div>
        <p title="Date du jour">{date}</p>
        <p title="2007 ?">9:41 am</p>
        <div
          title="Bisous"
          onClick={() => props.Login()}
          style={{ cursor: "pointer" }}
        >
          <CircumIcon name="logout" />
        </div>
      </div>
    </section>
  );
}
