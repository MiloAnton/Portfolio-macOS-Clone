import { useState } from "react";
import "./desktop.scss";

export default function Desktop({ openProjects }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const downloadCv = () => {
    const link = document.createElement("a");
    link.href = `${process.env.PUBLIC_URL}/CV-Milo-Roche-2026.pdf`;
    link.download = "CV-Milo-Roche-2026.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleKeyDown = (event, action) => {
    if (event.key === "Enter") action();
  };

  return (
    <section
      className="desktop-items"
      aria-label="Éléments du bureau"
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
          title="Double-cliquez pour télécharger le CV"
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
          title="Double-cliquez pour ouvrir Projets"
        >
          <span className="desktop-icon folder-icon">
            <span />
          </span>
          <span className="desktop-label">projets</span>
        </button>

    </section>
  );
}
