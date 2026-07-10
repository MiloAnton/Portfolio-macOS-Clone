import "./toolbar.scss";
import heart from "./../../assets/heart.svg";
import CircumIcon from "@klarr-agency/circum-icons-react";
import { useEffect, useState } from "react";

export default function Toolbar(props) {
  const [current, setCurrent] = useState(() => new Date());

  useEffect(() => {
    const clock = setInterval(() => setCurrent(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const date = current.toLocaleDateString("fr-FR");
  const time = current.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fullTime = current.toLocaleTimeString("fr-FR");

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
        ) : props.focusedWindow === "zIndexNotesWindow" ? (
          <p title="Vos notes sont sauvegardées dans votre navigateur">Notes</p>
        ) : props.focusedWindow === "zIndexFacetimeWindow" ? (
          <p title="Rien n'est enregistré ni envoyé">FaceTime</p>
        ) : props.focusedWindow === "zIndexTerminalWindow" ? (
          <p title="Tapez `help` pour commencer">Terminal</p>
        ) : props.focusedWindow === "zIndexSafariWindow" ? (
          <p title="Navigateur web intégré">Safari</p>
        ) : props.focusedWindow === "zIndexMessagesWindow" ? (
          <p title="Simulation locale, aucun message n’est envoyé">Messages</p>
        ) : null}
      </div>
      <div className="icons">
        <div title="Super le cloud">
          <CircumIcon name="cloud_on" size="30px"/>
        </div>
        <div title="Bluetooth enabled">
          <CircumIcon name="bluetooth"  size="30px"/>
        </div>
        <div title="Battery : 95%">
          <CircumIcon name="battery_full"  size="30px"/>
        </div>
        <p title="Date du jour">{date}</p>
        <p title={`Heure locale : ${fullTime}`}>{time}</p>
      </div>
    </section>
  );
}
