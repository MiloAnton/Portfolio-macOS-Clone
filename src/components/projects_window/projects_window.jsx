import projectsList from "./../../ressources/listProjects.json";
import { useLanguage } from "../../i18n/language";
import { EN_PROJECTS } from "../../i18n/content.en";
import "./projects_window.scss";

const COPY = {
  fr: {
    eyebrow: "Sélection de travaux",
    title: "Projets",
    intro: "Certains de mes projets terminés, parfois vendus, parfois offerts :)",
    count: (total) => `${total} projets`,
  },
  en: {
    eyebrow: "Selected work",
    title: "Projects",
    intro: "Some of my finished projects, sometimes sold, sometimes given away :)",
    count: (total) => `${total} projects`,
  },
};

export default function ProjectsWindow() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const projects =
    language === "en"
      ? projectsList.projects.map((project) => ({
          ...project,
          ...EN_PROJECTS[project.name],
        }))
      : projectsList.projects;

  return (
    <section className="page projects-page">
      <div className="content">
        <section className="experience" id="projects">
          <header className="projects-header">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2>{copy.title}</h2>
              <p className="intro">{copy.intro}</p>
            </div>
            <span className="project-count">{copy.count(projects.length)}</span>
          </header>
          <div className="card-container">
            {projects.map((element, index) => {
              return (
                <div className="cardExperience" key={element.name}>
                  <div className="project-topline">
                    <span className="project-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="project-date">{element.when}</span>
                  </div>
                  <h3>{element.name}</h3>
                  <p className="project-role">{element.function}</p>
                  {element.description && (
                    <p className="project-description">{element.description}</p>
                  )}
                  <div className="project-footer">
                    <span className="project-company">{element.where}</span>
                    <div className="project-tags">
                      {element.languages
                        .flatMap((language) => language.split(", "))
                        .map((tag) => (
                          <span key={tag}>{tag}</span>
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
