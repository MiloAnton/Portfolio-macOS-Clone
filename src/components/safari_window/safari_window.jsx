import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./safari_window.scss";

export const SAFARI_FAVORITES_STORAGE_KEY = "portfolio-safari-favorites-v1";
export const SAFARI_HISTORY_STORAGE_KEY = "portfolio-safari-history-v1";

const DEFAULT_FAVORITES = [
  {
    name: "Example",
    url: "https://example.com/",
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

const FAVORITE_COLORS = [
  "#007aff",
  "#5856d6",
  "#af52de",
  "#ff2d55",
  "#ff9500",
  "#34c759",
];

let fallbackId = 0;

const createId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  fallbackId += 1;
  return `safari-${Date.now()}-${fallbackId}`;
};

export const normalizeUrl = (value) => {
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

const getSiteName = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
};

const getFavoriteColor = (url) => {
  const hash = [...url].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );
  return FAVORITE_COLORS[hash % FAVORITE_COLORS.length];
};

const isStoredFavorite = (favorite) =>
  favorite &&
  typeof favorite.name === "string" &&
  typeof favorite.url === "string" &&
  normalizeUrl(favorite.url) === favorite.url;

const isStoredVisit = (visit) =>
  visit &&
  typeof visit.id === "string" &&
  typeof visit.url === "string" &&
  normalizeUrl(visit.url) === visit.url &&
  Number.isFinite(visit.visitedAt);

export const loadFavorites = () => {
  try {
    const storedFavorites = JSON.parse(
      localStorage.getItem(SAFARI_FAVORITES_STORAGE_KEY)
    );
    if (!Array.isArray(storedFavorites)) return DEFAULT_FAVORITES;
    return storedFavorites.filter(isStoredFavorite).slice(0, 24);
  } catch (error) {
    return DEFAULT_FAVORITES;
  }
};

export const loadHistory = () => {
  try {
    const storedHistory = JSON.parse(
      localStorage.getItem(SAFARI_HISTORY_STORAGE_KEY)
    );
    if (!Array.isArray(storedHistory)) return [];
    return storedHistory.filter(isStoredVisit).slice(0, 100);
  } catch (error) {
    return [];
  }
};

const saveCollection = (storageKey, collection) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(collection));
  } catch (error) {
    // Safari reste utilisable pendant la session si le stockage est indisponible.
  }
};

const formatVisitDate = (timestamp) =>
  new Date(timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function ToolbarIcon({ name }) {
  const paths = {
    back: <path d="m14.5 5-7 7 7 7" />,
    forward: <path d="m9.5 5 7 7-7 7" />,
    home: (
      <>
        <path d="m3.5 11 8.5-7 8.5 7" />
        <path d="M5.5 10v9.5h13V10M9.5 19.5v-6h5v6" />
      </>
    ),
    reload: (
      <>
        <path d="M19.5 8.5A8 8 0 1 0 20 14" />
        <path d="M19.5 3.5v5h-5" />
      </>
    ),
    stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
    external: (
      <>
        <path d="M13 4h7v7M20 4l-9 9" />
        <path d="M18 14v5.5H4.5v-13H10" />
      </>
    ),
    history: (
      <>
        <path d="M4.5 8.5H1.8V5.8" />
        <path d="M3 7a9 9 0 1 1 0 10" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    lock: (
      <>
        <rect x="5.5" y="10" width="13" height="10" rx="2" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
      </>
    ),
    search: <path d="m19 19-4-4m2-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function SafariWindow({
  isActive = true,
  isVisible = true,
}) {
  const [navigation, setNavigation] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [view, setView] = useState("start");
  const [address, setAddress] = useState("");
  const [favorites, setFavorites] = useState(loadFavorites);
  const [browsingHistory, setBrowsingHistory] = useState(loadHistory);
  const [documentGeneration, setDocumentGeneration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const addressRef = useRef(null);
  const iframeRef = useRef(null);
  const loadingGenerationRef = useRef(0);

  const currentUrl =
    view === "web" ? navigation[historyIndex] || "" : "";
  const isFavorite = useMemo(
    () => favorites.some((favorite) => favorite.url === currentUrl),
    [currentUrl, favorites]
  );

  useEffect(() => {
    saveCollection(SAFARI_FAVORITES_STORAGE_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    saveCollection(SAFARI_HISTORY_STORAGE_KEY, browsingHistory);
  }, [browsingHistory]);

  const beginLoading = useCallback(() => {
    const nextGeneration = loadingGenerationRef.current + 1;
    loadingGenerationRef.current = nextGeneration;
    setDocumentGeneration(nextGeneration);
    setIsLoading(true);
  }, []);

  const cancelLoading = useCallback(() => {
    loadingGenerationRef.current += 1;
    try {
      iframeRef.current?.contentWindow?.stop?.();
    } catch (error) {
      // L’accès à la fenêtre d’une iframe cross-origin peut être refusé.
    }
    setIsLoading(false);
  }, []);

  const addVisit = useCallback((url) => {
    const visit = {
      id: createId(),
      url,
      visitedAt: Date.now(),
    };
    setBrowsingHistory((currentHistory) =>
      [visit, ...currentHistory].slice(0, 100)
    );
  }, []);

  const navigate = useCallback(
    (value) => {
      const url = normalizeUrl(value);
      if (!url) {
        setError("Saisissez une adresse web valide.");
        return;
      }

      const nextNavigation = navigation.slice(0, historyIndex + 1);
      nextNavigation.push(url);
      setNavigation(nextNavigation);
      setHistoryIndex(nextNavigation.length - 1);
      setView("web");
      setAddress(url);
      setError("");
      addVisit(url);
      beginLoading();
    },
    [addVisit, beginLoading, historyIndex, navigation]
  );

  const goToHistoryIndex = useCallback(
    (nextIndex) => {
      const url = navigation[nextIndex];
      if (!url) return;
      setHistoryIndex(nextIndex);
      setView("web");
      setAddress(url);
      setError("");
      beginLoading();
    },
    [beginLoading, navigation]
  );

  const goHome = useCallback(() => {
    cancelLoading();
    setHistoryIndex(-1);
    setView("start");
    setAddress("");
    setError("");
  }, [cancelLoading]);

  const showHistory = useCallback(() => {
    cancelLoading();
    setView("history");
    setAddress("");
    setError("");
  }, [cancelLoading]);

  const goBack = () => {
    if (view === "history") {
      if (historyIndex >= 0) goToHistoryIndex(historyIndex);
      else goHome();
      return;
    }
    if (view !== "web") return;
    if (historyIndex === 0) goHome();
    else goToHistoryIndex(historyIndex - 1);
  };

  const goForward = () => {
    goToHistoryIndex(historyIndex + 1);
  };

  const reload = useCallback(() => {
    if (!currentUrl) return;
    beginLoading();
  }, [beginLoading, currentUrl]);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(address);
  };

  const toggleFavorite = () => {
    if (!currentUrl) return;
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (favorite) => favorite.url === currentUrl
      );
      if (alreadyFavorite) {
        return currentFavorites.filter(
          (favorite) => favorite.url !== currentUrl
        );
      }

      const name = getSiteName(currentUrl);
      return [
        ...currentFavorites,
        {
          name,
          url: currentUrl,
          color: getFavoriteColor(currentUrl),
          letter: name.charAt(0).toUpperCase() || "•",
        },
      ].slice(-24);
    });
  };

  const removeFavorite = (url) => {
    setFavorites((currentFavorites) =>
      currentFavorites.filter((favorite) => favorite.url !== url)
    );
  };

  const openExternal = useCallback(() => {
    if (currentUrl) window.open(currentUrl, "_blank", "noopener,noreferrer");
  }, [currentUrl]);

  useEffect(() => {
    if (!isActive || !isVisible) return undefined;

    const handleShortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLocaleLowerCase();
      if (key === "l") {
        event.preventDefault();
        addressRef.current?.focus();
        addressRef.current?.select();
      } else if (key === "r") {
        event.preventDefault();
        reload();
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [isActive, isVisible, reload]);

  const canGoBack = view === "history" || (view === "web" && historyIndex >= 0);
  const canGoForward =
    view !== "history" && historyIndex < navigation.length - 1;

  return (
    <>
      <div className="safari-toolbar">
        <div className="navigation-buttons">
          <button
            type="button"
            aria-label="Page précédente"
            disabled={!canGoBack}
            onClick={goBack}
          >
            <ToolbarIcon name="back" />
          </button>
          <button
            type="button"
            aria-label="Page suivante"
            disabled={!canGoForward}
            onClick={goForward}
          >
            <ToolbarIcon name="forward" />
          </button>
        </div>

        <button
          className="home-button"
          type="button"
          aria-label="Page d’accueil"
          onClick={goHome}
        >
          <ToolbarIcon name="home" />
        </button>

        <button
          className={`favorite-button${isFavorite ? " active" : ""}`}
          type="button"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
          disabled={!currentUrl}
          onClick={toggleFavorite}
        >
          <ToolbarIcon name="star" />
        </button>

        <form onSubmit={handleSubmit}>
          <span className="address-icon">
            <ToolbarIcon name={currentUrl ? "lock" : "search"} />
          </span>
          <input
            ref={addressRef}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={
              view === "history"
                ? "Historique"
                : "Rechercher ou saisir une adresse"
            }
            aria-label="Adresse web"
            spellCheck="false"
          />
        </form>

        <button
          className="reload-button"
          type="button"
          aria-label={isLoading ? "Arrêter le chargement" : "Recharger la page"}
          disabled={!currentUrl}
          onClick={isLoading ? cancelLoading : reload}
        >
          <ToolbarIcon name={isLoading ? "stop" : "reload"} />
        </button>

        <button
          className="history-button"
          type="button"
          aria-label="Afficher l’historique"
          aria-pressed={view === "history"}
          onClick={showHistory}
        >
          <ToolbarIcon name="history" />
        </button>

        <button
          className="external-button"
          type="button"
          aria-label="Ouvrir dans un nouvel onglet"
          disabled={!currentUrl}
          onClick={openExternal}
        >
          <ToolbarIcon name="external" />
        </button>
      </div>

      <div className="safari-content">
        {error && (
          <p className="safari-error" role="alert">
            {error}
          </p>
        )}

        {view === "start" && (
          <div className="safari-start-page">
            <div className="start-heading">
              <span className="safari-logo" aria-hidden="true">
                <span />
              </span>
              <div>
                <p>Bienvenue dans</p>
                <h2>Safari</h2>
              </div>
            </div>

            <section>
              <h3>Favoris</h3>
              {favorites.length > 0 ? (
                <div className="favorites-grid">
                  {favorites.map((favorite) => (
                    <div className="favorite-card" key={favorite.url}>
                      <button
                        type="button"
                        className="favorite-link"
                        onClick={() => navigate(favorite.url)}
                      >
                        <span style={{ background: favorite.color }}>
                          {favorite.letter}
                        </span>
                        <em>{favorite.name}</em>
                      </button>
                      <button
                        type="button"
                        className="remove-favorite"
                        aria-label={`Supprimer ${favorite.name} des favoris`}
                        onClick={() => removeFavorite(favorite.url)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">
                  Ajoute une page avec l’étoile de la barre d’outils.
                </p>
              )}
            </section>

            <p className="iframe-notice">
              Certains sites refusent leur affichage dans une iframe. Safari ne
              peut pas toujours détecter ce blocage : utilise alors le bouton
              d’ouverture externe dans la barre d’outils.
            </p>
          </div>
        )}

        {view === "history" && (
          <div className="safari-history-page">
            <header>
              <div>
                <p>Navigation locale</p>
                <h2>Historique</h2>
              </div>
              <button
                type="button"
                disabled={browsingHistory.length === 0}
                onClick={() => setBrowsingHistory([])}
              >
                Effacer l’historique
              </button>
            </header>

            {browsingHistory.length > 0 ? (
              <ol>
                {browsingHistory.map((visit) => (
                  <li key={visit.id}>
                    <button type="button" onClick={() => navigate(visit.url)}>
                      <span className="history-site-icon">
                        {getSiteName(visit.url).charAt(0).toUpperCase()}
                      </span>
                      <span className="history-details">
                        <strong>{getSiteName(visit.url)}</strong>
                        <small>{visit.url}</small>
                      </span>
                      <time dateTime={new Date(visit.visitedAt).toISOString()}>
                        {formatVisitDate(visit.visitedAt)}
                      </time>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="history-empty">
                <ToolbarIcon name="history" />
                <strong>Aucun historique</strong>
                <p>
                  Les pages visitées apparaîtront ici et resteront disponibles
                  à la prochaine ouverture.
                </p>
              </div>
            )}
          </div>
        )}

        {view === "web" && currentUrl && (
          <>
            <div className="iframe-help">
              <span>Le site reste vide ? Il bloque probablement les iframes.</span>
              <button type="button" onClick={openExternal}>
                <ToolbarIcon name="external" />
                Ouvrir dans un nouvel onglet
              </button>
            </div>
            <iframe
              ref={iframeRef}
              key={`${currentUrl}-${documentGeneration}`}
              src={currentUrl}
              title={`Safari — ${currentUrl}`}
              onLoad={() => {
                if (documentGeneration === loadingGenerationRef.current) {
                  setIsLoading(false);
                }
              }}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </>
        )}
      </div>
    </>
  );
}
