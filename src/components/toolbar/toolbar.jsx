import "./toolbar.scss";
import heart from "./../../assets/heart.svg";

export default function Toolbar() {
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
          <p>Milo</p>
        </a>
        <a href="#stack" title="Scroll vers ma stack technique">
          <p>Stack</p>
        </a>
        <a href="#pro" title="Scroll vers mes expériences">
          <p>Pro</p>
        </a>
        <a href="#education" title="Scroll vers mes diplômes">
          <p>Education</p>
        </a>
      </div>
      <div className="icons">
        <p>{date}</p>
        <p>9:41 am</p>
      </div>
    </section>
  );
}
