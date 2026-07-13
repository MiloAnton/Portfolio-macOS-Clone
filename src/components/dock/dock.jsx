import "./dock.scss";
import { useEffect } from "react";
import finder from "./../../assets/iconesDock/finder.png";
import projects from "./../../assets/iconesDock/projects.png";
import notes from "./../../assets/iconesDock/notes.png";
import safari from "./../../assets/iconesDock/safari.png";
import message from "./../../assets/iconesDock/message.png";
import facetime from "./../../assets/iconesDock/facetime.png";
import terminal from "./../../assets/iconesDock/terminal.svg";
import calculator from "./../../assets/iconesDock/calculator.svg";
import consoleIcon from "./../../assets/iconesDock/console.svg";
import games from "./../../assets/iconesDock/games.svg";

export default function Dock(props) {
  // Ajoute le point "app ouverte" sous l'icône, comme sur macOS.
  const openClass = (appId) => (props.openApps?.[appId] ? " open" : "");
  const today = new Date();
  const calendarMonth = today
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  useEffect(() => {
    const icons = Array.from(document.querySelectorAll(".dock .ico"));
    const reset = () => icons.forEach((icon) => {
      icon.style.transform = "scale(1) translateY(0px)";
    });
    const handlers = icons.map((icon, index) => {
      const focus = () => {
        icon.style.transform = "scale(1.5) translateY(-10px)";
        [
          [index - 1, "scale(1.2) translateY(-6px)"],
          [index + 1, "scale(1.2) translateY(-6px)"],
          [index - 2, "scale(1.1)"],
          [index + 2, "scale(1.1)"],
        ].forEach(([neighbourIndex, transform]) => {
          if (icons[neighbourIndex]) icons[neighbourIndex].style.transform = transform;
        });
      };
      icon.addEventListener("mouseenter", focus);
      icon.addEventListener("mouseleave", reset);
      return { icon, focus };
    });
    return () => handlers.forEach(({ icon, focus }) => {
      icon.removeEventListener("mouseenter", focus);
      icon.removeEventListener("mouseleave", reset);
    });
  }, []);

  return (
    <div className="dock">
      <div className="dock-container">
        <li className={`li-1${openClass("curriculum")}`} onClick={() => props.setCurriculum()}>
          <div className="name">Curriculum</div>
          <img className="ico" src={finder} alt="" />
        </li>
        <li className={`li-2${openClass("projects")}`} onClick={() => props.setProjects()}>
          <div className="name">Projets</div>
          <img className="ico" src={projects} alt="" />
        </li>
        <li className={`li-3${openClass("safari")}`} onClick={() => props.setSafari()}>
          <div className="name">Safari</div>
          <img className="ico" src={safari} alt="" />
        </li>
        <li className={`li-4${openClass("messages")}`} onClick={() => props.setMessages()}>
          <div className="name">Message</div>
          <img className="ico" src={message} alt="" />
        </li>
        <li className={`li-6${openClass("facetime")}`} onClick={() => props.setFacetime()}>
          <div className="name">FaceTime</div>
          <img className="ico" src={facetime} alt="" />
        </li>
        <li className={`li-11${openClass("calendar")}`} onClick={() => props.setCalendar()}>
          <div className="name">Calendrier</div>
          <div className="ico calendar-dock-icon" aria-hidden="true">
            <span>{calendarMonth}</span>
            <strong>{today.getDate()}</strong>
          </div>
        </li>
        <li className={`li-5${openClass("notes")}`} onClick={() => props.setNotes()}>
          <div className="name">Notes</div>
          <img className="ico" src={notes} alt="" />
        </li>
        <li className={`li-7${openClass("terminal")}`} onClick={() => props.setTerminal()}>
          <div className="name">Terminal</div>
          <img className="ico" src={terminal} alt="" />
        </li>
        <li className={`li-8${openClass("calculator")}`} onClick={() => props.setCalculator()}>
          <div className="name">Calculatrice</div>
          <img className="ico ico-system-app" src={calculator} alt="" />
        </li>
        <li className={`li-9${openClass("console")}`} onClick={() => props.setConsole()}>
          <div className="name">Console</div>
          <img className="ico ico-system-app" src={consoleIcon} alt="" />
        </li>
        <li className={`li-10${openClass("games")}`} onClick={() => props.setGames()}>
          <div className="name">Jeux</div>
          <img className="ico ico-system-app" src={games} alt="" />
        </li>
      </div>
    </div>
  );
}
