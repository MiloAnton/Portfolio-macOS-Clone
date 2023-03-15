import "./dock.scss";
import finder from "./../../assets/iconesDock/finder.png";
import projects from "./../../assets/iconesDock/projects.png";
import people from "./../../assets/iconesDock/people.png";
import notes from "./../../assets/iconesDock/notes.png";
import trash from "./../../assets/iconesDock/trash.png";
import safari from "./../../assets/iconesDock/safari.png";

export default function Dock(props) {
  let icons = document.querySelectorAll(".ico");
  let length = icons.length;

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
    let previous = index - 1;
    let previous1 = index - 2;
    let next = index + 1;
    let next2 = index + 2;

    if (previous === -1) {
      elem.style.transform = "scale(1.5)  translateY(-10px)";
    } else if (next === length) {
      elem.style.transform = "scale(1.5)  translateY(-10px)";
    } else {
      elem.style.transform = "scale(1.5)  translateY(-10px)";
      icons[previous].style.transform = "scale(1.2) translateY(-6px)";
      icons[previous1].style.transform = "scale(1.1)";
      icons[next].style.transform = "scale(1.2) translateY(-6px)";
      icons[next2].style.transform = "scale(1.1)";
    }
  };

  return (
    <div className="dock">
      <div className="dock-container">
        <li className="li-1" onClick={() => props.setCurriculum()}>
          <div className="name">WHOAMI</div>
          <img className="ico" src={finder} alt="" />
        </li>
        <li className="li-2" onClick={() => props.setProjects()}>
          <div className="name">Projets</div>
          <img className="ico" src={projects} alt="" />
        </li>
        <li className="li-4" onClick={() => props.setSafari()}>
          <div className="name">Safari</div>
          <img className="ico" src={safari} alt="" />
        </li>
        <li className="li-5">
          <div className="name">Notes</div>
          <img className="ico" src={notes} alt="" />
        </li>
        <li className="li-bin li-15" onClick={() => props.setTutorial()}>
          <div className="name">Bin</div>
          <img className="ico ico-bin" src={trash} alt="" />
        </li>
      </div>
    </div>
  );
}
