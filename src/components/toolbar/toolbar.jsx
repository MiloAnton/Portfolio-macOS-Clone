import "./toolbar.scss";
import heart from "./../../assets/heart.svg";
import { useEffect, useState } from "react";

const BluetoothIcon = () => (
  <svg viewBox="0 0 16 20" aria-hidden="true">
    <path d="M7.5 1.5v17l5-4.5-9-8 9 8-5 4.5m0-17 5 4.5-9 8" />
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 26 13" aria-hidden="true">
    <rect x="1" y="1" width="21" height="11" rx="2.5" />
    <path d="M24 4.5v4" />
    <rect className="battery-level" x="3" y="3" width="17" height="7" rx="1" />
  </svg>
);

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
        ) : props.focusedWindow === "zIndexCalculatorWindow" ? (
          <p>Calculatrice</p>
        ) : props.focusedWindow === "zIndexConsoleWindow" ? (
          <p title="Événements internes du portfolio">Console</p>
        ) : props.focusedWindow === "zIndexGamesWindow" ? (
          <p>Jeux</p>
        ) : null}
      </div>
      <div className="icons">
        <div className="status-icon bluetooth-icon" title="Bluetooth activé">
          <BluetoothIcon />
        </div>
        <div className="status-icon battery-icon" title="Batterie : 95 %">
          <BatteryIcon />
        </div>
        <div className="date-time">
          <p title="Date du jour">{date}</p>
          <p title={`Heure locale : ${fullTime}`}>{time}</p>
        </div>
      </div>
    </section>
  );
}
