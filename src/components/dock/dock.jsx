import "./dock.scss";
import finder from "./../../assets/iconesDock/finder.png"
import siri from "./../../assets/iconesDock/siri.png"
import appstore from "./../../assets/iconesDock/appstore.png"
import contacts from "./../../assets/iconesDock/contacts.png"
import facetime from "./../../assets/iconesDock/facetime.png"
import launchpad from "./../../assets/iconesDock/launchpad.png"
import message from "./../../assets/iconesDock/message.png"
import music from "./../../assets/iconesDock/music.png"
import notes from "./../../assets/iconesDock/notes.png"
import photos from "./../../assets/iconesDock/photos.png"
import podcasts from "./../../assets/iconesDock/podcasts.png"
import reminders from "./../../assets/iconesDock/reminders.png"
import safari from "./../../assets/iconesDock/safari.png"
import trash from "./../../assets/iconesDock/trash.png"
import tv from "./../../assets/iconesDock/tv.png"

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
          <div className="name">Finder</div>
          <img
            className="ico"
            src={finder}
            alt=""
          />
        </li>
        <li className="li-2" onClick={() => props.setProjects()}>
          <div className="name">Projets</div>
          <img
            className="ico"
            src={siri}
            alt=""
          />
        </li>
        <li className="li-3" onClick={() => props.setLinks()}>
          <div className="name">Liens</div>
          <img
            className="ico"
            src={launchpad}
            alt=""
          />
        </li>
        <li className="li-4">
          <div className="name">Contacts</div>
          <img
            className="ico"
            src={contacts}
            alt=""
          />
        </li>
        <li className="li-5">
          <div className="name">Notes</div>
          <img
            className="ico"
            src={notes}
            alt=""
          />
        </li>
        <li className="li-6">
          <div className="name">Reminders</div>
          <img
            className="ico"
            src={reminders}
            alt=""
          />
        </li>
        <li className="li-7">
          <div className="name">Photos</div>
          <img
            className="ico"
            src={photos}
            alt=""
          />
        </li>
        <li className="li-8">
          <div className="name">Messages</div>
          <img
            className="ico"
            src={message}
            alt=""
          />
        </li>
        <li className="li-9">
          <div className="name">FaceTime</div>
          <img
            className="ico"
            src={facetime}
            alt=""
          />
        </li>
        <li className="li-10">
          <div className="name">Music</div>
          <img
            className="ico"
            src={music}
            alt=""
          />
        </li>
        <li className="li-11">
          <div className="name">Podcasts</div>
          <img
            className="ico"
            src={podcasts}
            alt=""
          />
        </li>
        <li className="li-12">
          <div className="name">TV</div>
          <img
            className="ico"
            src={tv}
            alt=""
          />
        </li>
        <li className="li-12">
          <div className="name">App Store</div>
          <img
            className="ico"
            src={appstore}
            alt=""
          />
        </li>
        <li className="li-14">
          <div className="name">Safari</div>
          <img
            className="ico"
            src={safari}
            alt=""
          />
        </li>
        <li className="li-bin li-15">
          <div className="name">Bin</div>
          <img
            className="ico ico-bin"
            src={trash}
            alt=""
          />
        </li>
      </div>
    </div>
  );
}
