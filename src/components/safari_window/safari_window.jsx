import { useState } from "react";
import "./safari_window.scss";

const FAVORITES = [
  {
    name: "Example",
    url: "https://example.com",
    color: "#ff9f0a",
    letter: "E",
  },
  {
    name: "OpenStreetMap",
    url: "https://www.openstreetmap.org/export/embed.html",
    color: "#30b350",
    letter: "O",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    color: "#ff3b30",
    letter: "Y",
  },
];

const normalizeUrl = (value) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`
    );
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch (error) {
    return null;
  }
};

export default function SafariWindow(props) {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [address, setAddress] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUrl = history[historyIndex] || "";

  const navigate = (value) => {
    const url = normalizeUrl(value);
    if (!url) {
      setError("Saisissez une adresse web valide.");
      return;
    }

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(url);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAddress(url);
    setError("");
    setIsLoading(true);
  };

  const goToHistory = (nextIndex) => {
    setHistoryIndex(nextIndex);
    setAddress(history[nextIndex]);
    setError("");
    setIsLoading(true);
  };

  const goHome = () => {
    setHistoryIndex(-1);
    setAddress("");
    setError("");
    setIsLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(address);
  };

  const reload = () => {
    if (!currentUrl) return;
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  return (
    <>
        <div className="safari-toolbar">
          <div className="navigation-buttons">
            <button
              type="button"
              aria-label="Page précédente"
              disabled={historyIndex < 0}
              onClick={() =>
                historyIndex === 0 ? goHome() : goToHistory(historyIndex - 1)
              }
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Page suivante"
              disabled={historyIndex >= history.length - 1}
              onClick={() => goToHistory(historyIndex + 1)}
            >
              ›
            </button>
          </div>

          <button className="home-button" type="button" onClick={goHome}>
           ⌂
          </button>

          <form onSubmit={handleSubmit}>
            <span className="security-icon">{currentUrl ? "🔒" : "⌕"}</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Saisissez une adresse web"
              aria-label="Adresse web"
              spellCheck="false"
            />
            {isLoading && <span className="loading-indicator" />}
          </form>

          <button
            className="reload-button"
            type="button"
            aria-label="Recharger la page"
            disabled={!currentUrl}
            onClick={reload}
          >
            ↻
          </button>
          <button
            className="external-button"
            type="button"
            aria-label="Ouvrir dans un nouvel onglet"
            disabled={!currentUrl}
            onClick={() => window.open(currentUrl, "_blank", "noopener")}
          >
            ↗
          </button>
        </div>

        <div className="safari-content">
          {error && <p className="safari-error">{error}</p>}
          {!currentUrl ? (
            <div className="safari-start-page">
              <div className="start-heading">
                <span className="safari-logo">◉</span>
                <div>
                  <p>Bienvenue dans</p>
                  <h2>Safari</h2>
                </div>
              </div>
              <section>
                <h3>Favoris</h3>
                <div className="favorites-grid">
                  {FAVORITES.map((favorite) => (
                    <button
                      type="button"
                      key={favorite.url}
                      onClick={() => navigate(favorite.url)}
                    >
                      <span style={{ background: favorite.color }}>
                        {favorite.letter}
                      </span>
                      {favorite.name}
                    </button>
                  ))}
                </div>
              </section>
              <p className="iframe-notice">
                Certains sites bloquent leur affichage dans une iframe. Dans ce
                cas, utilisez le bouton ↗ pour les ouvrir dans un nouvel onglet.
              </p>
            </div>
          ) : (
            <iframe
              key={`${currentUrl}-${reloadKey}`}
              src={currentUrl}
              title={`Safari — ${currentUrl}`}
              onLoad={() => setIsLoading(false)}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          )}
        </div>
    </>
  );
}
