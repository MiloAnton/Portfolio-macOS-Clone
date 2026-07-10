import "./dock.scss";
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
  let icons = document.querySelectorAll(".ico");

  icons.forEach((item, index) => {
    item.addEventListener("mouseover", (e) => {
      focus(e.target, index);
    });
    item.addEventListener("mouseleave", (e) => {
      icons.forEach((item) => {
        item.style.transform = "scale(1)  translateY(0px)";
      });
    });
  });

  const focus = (elem, index) => {
    elem.style.transform = "scale(1.5)  translateY(-10px)";
    const neighbours = [
      [index - 1, "scale(1.2) translateY(-6px)"],
      [index + 1, "scale(1.2) translateY(-6px)"],
      [index - 2, "scale(1.1)"],
      [index + 2, "scale(1.1)"],
    ];
    neighbours.forEach(([neighbourIndex, transform]) => {
      if (icons[neighbourIndex]) {
        icons[neighbourIndex].style.transform = transform;
      }
    });
  };

  return (
    <div className="dock">
      <div className="dock-container">
        <li className="li-1" onClick={() => props.setCurriculum()}>
          <div className="name">Curriculum</div>
          <img className="ico" src={finder} alt="" />
        </li>
        <li className="li-2" onClick={() => props.setProjects()}>
          <div className="name">Projets</div>
          <img className="ico" src={projects} alt="" />
        </li>
        <li className="li-2" onClick={() => props.setSafari()}>
          <div className="name">Safari</div>
          <img className="ico" src={safari} alt="" />
        </li>
        <li className="li-2" onClick={() => props.setMessages()}>
          <div className="name">Message</div>
          <img className="ico" src={message} alt="" />
        </li>
        <li className="li-5" onClick={() => props.setNotes()}>
          <div className="name">Notes</div>
          <img className="ico" src={notes} alt="" />
        </li>
        <li className="li-6" onClick={() => props.setFacetime()}>
          <div className="name">FaceTime</div>
          <img className="ico" src={facetime} alt="" />
        </li>
        <li className="li-7" onClick={() => props.setTerminal()}>
          <div className="name">Terminal</div>
          <img className="ico" src={terminal} alt="" />
        </li>
        <li className="li-8" onClick={() => props.setCalculator()}>
          <div className="name">Calculatrice</div>
          <img className="ico" src={calculator} alt="" />
        </li>
        <li className="li-9" onClick={() => props.setConsole()}>
          <div className="name">Console</div>
          <img className="ico" src={consoleIcon} alt="" />
        </li>
        <li className="li-10" onClick={() => props.setGames()}>
          <div className="name">Jeux</div>
          <img className="ico" src={games} alt="" />
        </li>
      </div>
    </div>
  );
}
