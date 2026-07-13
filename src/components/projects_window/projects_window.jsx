import projectsList from "./../../ressources/listProjects.json";
import "./projects_window.scss";

export default function ProjectsWindow() {
  return (
        <section className="page projects-page">
          <div className="content">
            <section className="experience" id="projects">
              <header className="projects-header">
                <div>
                  <p className="eyebrow">Sélection de travaux</p>
                  <h2>Projets</h2>
                  <p className="intro">
                    Certains de mes projets terminés, parfois vendus, parfois offerts :)
                  </p>
                </div>
                <span className="project-count">
                  {projectsList.projects.length} projets
                </span>
              </header>
              <div className="card-container">
                {projectsList.projects.map((element, index) => {
                  return (
                    <div className="cardExperience" key={index}>
                      <div className="project-topline">
                        <span className="project-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="project-date">{element.when}</span>
                      </div>
                      <h3>{element.name}</h3>
                      <p className="project-role">{element.function}</p>
                      {element.description && (
                        <p className="project-description">
                          {element.description}
                        </p>
                      )}
                      <div className="project-footer">
                        <span className="project-company">{element.where}</span>
                        <div className="project-tags">
                          {element.languages.flatMap((language) =>
                            language.split(", ")
                          ).map((language) => (
                            <span key={language}>{language}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
  );
}
