import "./main_window.scss";
import listStack from "./../../ressources/listStack.json";
import educationList from "./../../ressources/listEducation.json";
import experienceList from "./../../ressources/listExperiences.json";
import obs from "./../../assets/logosEntreprises/obs.png";
import bytel from "./../../assets/logosEntreprises/bytel.png";
import cf from "./../../assets/logosEntreprises/cf.png";

export default function MainWindow() {
  return (
    <section className="page">
      <div className="content">
        <section className="presentation" id="perso">
          <div className="round" />
          <div>
            <h2>Milo Roche-Vandenbroucque</h2>
            <h3>Alternant et entrepreneur passionné !</h3>
          </div>
        </section>
        <section className="stack" id="stack">
          <h2>Stack maîtrisée</h2>
          <h3>Frontend</h3>
          <div className="iconesStack">
            {listStack.frontend.map((element) => {
              return (
                <div>
                  <p key={element.nom}>{element.nom}</p>
                </div>
              );
            })}
          </div>
          <h3>Backend</h3>
          <div className="iconesStack">
            {listStack.backend.map((element) => {
              return <p key={element.nom}>{element.nom}</p>;
            })}
          </div>
          <h3>DevOps</h3>
          <div className="iconesStack">
            {listStack.devops.map((element) => {
              return <p key={element.nom}>{element.nom}</p>;
            })}
          </div>
          <h3>Langages</h3>
          <div className="iconesStack">
            {listStack.langages.map((element) => {
              return <p key={element.nom}>{element.nom}</p>;
            })}
          </div>
          <h3>Autres</h3>
          <div className="iconesStack">
            {listStack.autres.map((element) => {
              return <p key={element.nom}>{element.nom}</p>;
            })}
          </div>
          <h3>OS</h3>
          <div className="iconesStack">
            {listStack.os.map((element) => {
              return <p key={element.nom}>{element.nom}</p>;
            })}
          </div>
        </section>
        <section className="experience" id="pro">
          <h2>Expériences</h2>
            <div className="card-container">
              {experienceList.experiences.map((element, index) => {
                return (
                    <div className="cardExperience" key={index}>
                      <div className="row">
                        <img
                          src={
                            element.logo === "obs"
                              ? obs
                              : element.logo === "bytel"
                              ? bytel
                              : element.logo === "cf"
                              ? cf
                              : null
                          }
                          alt="logo"
                        />
                      </div>
                      <div className="rowText">
                        <h4>{element.poste}</h4>-<p>{element.contrat}</p>
                      </div>
                      <p>{element.timeline}</p>
                      <ul>
                        {element.description.map((item) => {
                          return <li key={element.item}>{item}</li>;
                        })}
                      </ul>
                    </div>
                );
              })}
            </div>
        </section>
        <section className="education" id="education">
          <h2>Education</h2>
            <div className="card-container">
              {educationList.education.map((element, index) => {
                return (
                  <div className="cardEducation" key={index}>
                    <h3>{element.ecole}</h3>
                    <h4>{element.diplome}</h4>
                    <p>{element.localisation}</p>
                    <p>{element.timeline}</p>
                    <p>{element.description}</p>
                    <p>---------------------------</p>
                  </div>
                );
              })}
            </div>
        </section>
      </div>
    </section>
  );
}
