import "./loginPage.scss";
import Toolbar from "../toolbar/toolbar";
import profilepic from "./../../assets/logo512.png";
import loginarrow from "./../../assets/loginarrow.png";

export default function LoginPage(props) {
  return (
    <>
      <Toolbar />
      <section className="login-container">
        <div className="login-box">
          <img className="profile-image" src={profilepic} alt="Profile" />
          <h2>Portfolio</h2>
          <div className="password-container">
            <input type="password" value="●●●●●●●●" readOnly />
            <button
              className="login"
              onClick={() => props.Login()}
              title="Connexion"
            >
              <div className="tooltip">Cliquez ici !</div>
              <img src={loginarrow} alt="Login arrow" height="30px" />
            </button>
          </div>
          <p>Cliquez sur connexion pour explorer mon portfolio</p>
        </div>
      </section>
    </>
  );
}
