import { useState } from "react";
import "./desktop.scss";
import { downloadCv } from "../../utils/downloadCv";
import { useLanguage } from "../../i18n/language";

const COPY = {
  fr: {
    ariaLabel: "Éléments du bureau",
    cvTitle: "Double-cliquez pour télécharger le CV",
    projectsLabel: "projets",
    projectsTitle: "Double-cliquez pour ouvrir Projets",
  },
  en: {
    ariaLabel: "Desktop items",
    cvTitle: "Double-click to download the resume",
    projectsLabel: "projects",
    projectsTitle: "Double-click to open Projects",
  },
};

export default function Desktop({ openProjects }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const { language } = useLanguage();
  const copy = COPY[language];

  const handleKeyDown = (event, action) => {
    if (event.key === "Enter") action();
  };

  return (
    <section
      className="desktop-items"
      aria-label={copy.ariaLabel}
      onClick={() => setSelectedItem(null)}
    >
        <button
          className={`desktop-item ${selectedItem === "cv" ? "selected" : ""}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedItem("cv");
          }}
          onDoubleClick={downloadCv}
          onKeyDown={(event) => handleKeyDown(event, downloadCv)}
          title={copy.cvTitle}
        >
          <span className="desktop-icon pdf-icon">
            <span>PDF</span>
          </span>
          <span className="desktop-label">CV.pdf</span>
        </button>

        <button
          className={`desktop-item ${
            selectedItem === "projects" ? "selected" : ""
          }`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedItem("projects");
          }}
          onDoubleClick={openProjects}
          onKeyDown={(event) => handleKeyDown(event, openProjects)}
          title={copy.projectsTitle}
        >
          <span className="desktop-icon folder-icon">
            <span />
          </span>
          <span className="desktop-label">{copy.projectsLabel}</span>
        </button>

    </section>
  );
}
