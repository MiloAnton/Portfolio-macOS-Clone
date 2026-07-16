import { useEffect, useMemo, useRef, useState } from "react";
import version from "../../../package.json";
import {
  addPortfolioLog,
  clearPortfolioLogs,
  getPortfolioLogs,
  MAX_PORTFOLIO_LOGS,
  subscribeToPortfolioLogs,
} from "../../utils/portfolioLogger";
import "./console_window.scss";

const LOG_LEVELS = ["info", "success", "warning", "error"];
const COLUMN_LIMITS = {
  time: [66, 150],
  level: [82, 180],
  source: [86, 260],
  message: [180, 900],
};

const COMMANDS = [
  { name: "help", completion: "help", detail: "afficher les commandes" },
  { name: "clear", completion: "clear", detail: "effacer les événements" },
  { name: "status", completion: "status", detail: "observer l’état de l’application" },
  { name: "version", completion: "version", detail: "afficher la version" },
  { name: "pause", completion: "pause", detail: "suspendre l’affichage" },
  { name: "resume", completion: "resume", detail: "reprendre l’affichage" },
  { name: "filter", completion: "filter ", detail: "filtrer par niveau" },
  { name: "search", completion: "search ", detail: "rechercher dans les logs" },
  { name: "reset", completion: "reset", detail: "réinitialiser les filtres" },
];

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

const appendBoundedLogs = (currentLogs, newLogs) =>
  [...currentLogs, ...newLogs].slice(-MAX_PORTFOLIO_LOGS);

const serializeLog = (log) => ({
  id: log.id,
  timestamp: log.timestamp.toISOString(),
  level: log.level,
  source: log.source,
  message: log.message,
});

const logsToText = (logs) =>
  logs
    .map(
      (log) =>
        `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] ${log.source} — ${log.message}`
    )
    .join("\n");

const createDataUrl = (mimeType, content) =>
  `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;

const levelLabel = (level) => {
  const labels = {
    all: "Tous",
    info: "Infos",
    success: "Succès",
    warning: "Alertes",
    error: "Erreurs",
  };
  return labels[level];
};

function LevelIcon({ level }) {
  const shapes = {
    all: (
      <>
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="7" r="2.5" />
        <circle cx="7" cy="17" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10.5V17M12 7h.01" />
      </>
    ),
    success: <path d="m4 12.5 5 5L20 6.5" />,
    warning: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    error: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {shapes[level]}
    </svg>
  );
}

function ActionIcon({ name }) {
  const shapes = {
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7V5Z" />,
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    json: (
      <>
        <path d="M8 4H5v16h3M16 4h3v16h-3" />
        <path d="M12 8v8M10 14l2 2 2-2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12M7.5 11 12 15.5l4.5-4.5" />
        <path d="M4 19h16" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4 4" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {shapes[name]}
    </svg>
  );
}

export default function ConsoleWindow({
  isActive = true,
  isVisible = true,
  openWindowCount = 0,
}) {
  const [logs, setLogs] = useState(getPortfolioLogs);
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyCursor, setHistoryCursor] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [columnWidths, setColumnWidths] = useState({
    time: 84,
    level: 102,
    source: 124,
    message: 260,
  });
  const pausedRef = useRef(false);
  const pausedLogsRef = useRef([]);
  const bottomRef = useRef(null);
  const commandRef = useRef(null);
  const searchRef = useRef(null);
  const rowRefs = useRef(new Map());
  const resizeCleanupRef = useRef(null);

  useEffect(() =>
    subscribeToPortfolioLogs(
      (entry) => {
        if (pausedRef.current) {
          pausedLogsRef.current = appendBoundedLogs(
            pausedLogsRef.current,
            [entry]
          );
          setPendingCount(pausedLogsRef.current.length);
        } else {
          setLogs((currentLogs) =>
            appendBoundedLogs(currentLogs, [entry])
          );
        }
      },
      () => {
        pausedLogsRef.current = [];
        setPendingCount(0);
        setLogs([]);
      }
    ), []);

  useEffect(() => {
    if (!isPaused) bottomRef.current?.scrollIntoView();
  }, [isPaused, logs]);

  useEffect(() => {
    if (!isActive || !isVisible) return undefined;
    const handleShortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLocaleLowerCase();
      if (key === "k") {
        event.preventDefault();
        commandRef.current?.focus();
      } else if (key === "f") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [isActive, isVisible]);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
    },
    []
  );

  const visibleLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR");
    return logs.filter((log) => {
      const matchesLevel = level === "all" || log.level === level;
      const matchesQuery =
        !normalizedQuery ||
        `${log.source} ${log.message}`
          .toLocaleLowerCase("fr-FR")
          .includes(normalizedQuery);
      return matchesLevel && matchesQuery;
    });
  }, [logs, level, query]);

  const levelCounts = useMemo(
    () =>
      LOG_LEVELS.reduce(
        (counts, logLevel) => ({
          ...counts,
          [logLevel]: logs.filter((log) => log.level === logLevel).length,
        }),
        { all: logs.length }
      ),
    [logs]
  );

  const selectedLog = visibleLogs.find((log) => log.id === selectedLogId);
  const exportLogs = useMemo(
    () => (selectedLog ? [selectedLog] : visibleLogs),
    [selectedLog, visibleLogs]
  );
  const plainTextExport = useMemo(() => logsToText(exportLogs), [exportLogs]);
  const jsonExport = useMemo(
    () => JSON.stringify(exportLogs.map(serializeLog), null, 2),
    [exportLogs]
  );
  const exportDate = new Date().toISOString().slice(0, 10);

  const commandSuggestions = useMemo(() => {
    const normalizedCommand = command.trimStart().toLocaleLowerCase("fr-FR");
    if (!normalizedCommand || normalizedCommand.includes(" ")) return [];
    return COMMANDS.filter((item) =>
      item.name.startsWith(normalizedCommand)
    ).slice(0, 4);
  }, [command]);

  const pause = () => {
    pausedRef.current = true;
    setIsPaused(true);
    setFeedback("");
  };

  const resume = () => {
    pausedRef.current = false;
    const pendingLogs = pausedLogsRef.current;
    pausedLogsRef.current = [];
    setPendingCount(0);
    setIsPaused(false);
    if (pendingLogs.length > 0) {
      setLogs((currentLogs) =>
        appendBoundedLogs(currentLogs, pendingLogs)
      );
    }
  };

  const togglePause = () => {
    if (isPaused) resume();
    else pause();
  };

  const copyLogs = async () => {
    if (exportLogs.length === 0) return;
    try {
      await navigator.clipboard.writeText(plainTextExport);
      setFeedback(
        selectedLog
          ? "Événement copié"
          : exportLogs.length === 1
            ? "1 log copié"
            : `${exportLogs.length} logs copiés`
      );
    } catch (error) {
      setFeedback("Copie indisponible");
    }
  };

  const completeCommand = (suggestion) => {
    setCommand(suggestion.completion);
    setHistoryCursor(-1);
    requestAnimationFrame(() => commandRef.current?.focus());
  };

  const runCommand = (event) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;
    const [rawName, ...args] = input.split(/\s+/);
    const name = rawName.toLocaleLowerCase("fr-FR");
    setCommandHistory((currentHistory) =>
      [...currentHistory.filter((item) => item !== input), input].slice(-30)
    );
    setHistoryCursor(-1);
    setCommand("");
    setFeedback("");

    if (name === "clear") {
      clearPortfolioLogs();
    } else if (name === "help") {
      addPortfolioLog(
        "success",
        "console-inspector",
        "Observation : help, clear, status, version, pause, resume, filter <niveau>, search <texte>, reset"
      );
    } else if (name === "status") {
      addPortfolioLog(
        "success",
        "runtime",
        `${openWindowCount} fenêtre${openWindowCount > 1 ? "s" : ""} ouverte${
          openWindowCount > 1 ? "s" : ""
        } · ${logs.length}/${MAX_PORTFOLIO_LOGS} événements conservés`
      );
    } else if (name === "version") {
      addPortfolioLog("info", "portfolio", `Version ${version.version}`);
    } else if (name === "pause") {
      pause();
    } else if (name === "resume") {
      resume();
    } else if (name === "filter") {
      const nextLevel = (args[0] || "all").toLocaleLowerCase("fr-FR");
      if (["all", ...LOG_LEVELS].includes(nextLevel)) {
        setLevel(nextLevel);
      } else {
        addPortfolioLog(
          "warning",
          "console-inspector",
          `Niveau inconnu : ${nextLevel}`
        );
      }
    } else if (name === "search") {
      setQuery(args.join(" "));
    } else if (name === "reset") {
      setLevel("all");
      setQuery("");
      setSelectedLogId(null);
    } else {
      addPortfolioLog(
        "error",
        "console-inspector",
        `Commande d’observation inconnue : ${name}`
      );
    }
  };

  const handleCommandKeyDown = (event) => {
    if (event.key === "Tab" && commandSuggestions.length > 0) {
      event.preventDefault();
      completeCommand(commandSuggestions[0]);
      return;
    }
    if (event.key === "ArrowUp" && commandHistory.length > 0) {
      event.preventDefault();
      const nextCursor = Math.min(
        historyCursor + 1,
        commandHistory.length - 1
      );
      setHistoryCursor(nextCursor);
      setCommand(commandHistory[commandHistory.length - 1 - nextCursor]);
    } else if (event.key === "ArrowDown" && historyCursor >= 0) {
      event.preventDefault();
      const nextCursor = historyCursor - 1;
      setHistoryCursor(nextCursor);
      setCommand(
        nextCursor < 0
          ? ""
          : commandHistory[commandHistory.length - 1 - nextCursor]
      );
    } else if (event.key === "Escape") {
      setCommand("");
      setHistoryCursor(-1);
    }
  };

  const resizeColumn = (column, delta) => {
    const [minimum, maximum] = COLUMN_LIMITS[column];
    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [column]: clamp(currentWidths[column] + delta, minimum, maximum),
    }));
  };

  const startColumnResize = (column, event) => {
    event.preventDefault();
    resizeCleanupRef.current?.();
    const startX = event.clientX;
    const initialWidth = columnWidths[column];
    const [minimum, maximum] = COLUMN_LIMITS[column];
    const handlePointerMove = (moveEvent) => {
      const width = clamp(
        initialWidth + moveEvent.clientX - startX,
        minimum,
        maximum
      );
      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [column]: width,
      }));
    };
    const stopResizing = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      resizeCleanupRef.current = null;
    };
    resizeCleanupRef.current = stopResizing;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
  };

  const handleRowKeyDown = (index, event) => {
    let nextIndex = null;
    if (event.key === "ArrowDown") nextIndex = Math.min(index + 1, visibleLogs.length - 1);
    else if (event.key === "ArrowUp") nextIndex = Math.max(index - 1, 0);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = visibleLogs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextLog = visibleLogs[nextIndex];
    setSelectedLogId(nextLog.id);
    rowRefs.current.get(nextLog.id)?.focus();
  };

  const tableStyle = {
    "--console-time-width": `${columnWidths.time}px`,
    "--console-level-width": `${columnWidths.level}px`,
    "--console-source-width": `${columnWidths.source}px`,
    "--console-message-width": `${columnWidths.message}px`,
  };
  const levels = ["all", ...LOG_LEVELS];

  return (
    <section className="console-app">
      <div className="console-toolbar">
        <button
          type="button"
          onClick={togglePause}
          className={isPaused ? "paused" : ""}
          aria-label={isPaused ? "Reprendre les logs" : "Mettre les logs en pause"}
        >
          <ActionIcon name={isPaused ? "play" : "pause"} />
          <span>{isPaused ? "Reprendre" : "Pause"}</span>
        </button>
        <button type="button" onClick={clearPortfolioLogs} aria-label="Effacer les logs">
          <ActionIcon name="trash" />
          <span>Effacer</span>
        </button>
        <span className="toolbar-divider" />
        <button type="button" onClick={copyLogs} disabled={exportLogs.length === 0}>
          <ActionIcon name="copy" />
          <span>Copier</span>
        </button>
        <a
          href={createDataUrl("application/json", jsonExport)}
          download={`portfolio-logs-${exportDate}.json`}
          aria-disabled={exportLogs.length === 0}
          onClick={(event) => exportLogs.length === 0 && event.preventDefault()}
        >
          <ActionIcon name="json" />
          <span>Exporter en JSON</span>
        </a>
        <a
          href={createDataUrl("text/plain", plainTextExport)}
          download={`portfolio-logs-${exportDate}.log`}
          aria-disabled={exportLogs.length === 0}
          onClick={(event) => exportLogs.length === 0 && event.preventDefault()}
        >
          <ActionIcon name="download" />
          <span>Télécharger les logs</span>
        </a>
        {feedback && <output className="console-feedback">{feedback}</output>}
      </div>

      <div className="console-filters">
        <div className="level-counters" aria-label="Filtrer par niveau">
          {levels.map((item) => (
            <button
              type="button"
              className={`${item}${level === item ? " active" : ""}`}
              aria-label={`Afficher ${levelLabel(item)} (${levelCounts[item] || 0})`}
              aria-pressed={level === item}
              onClick={() => setLevel(item)}
              key={item}
            >
              <LevelIcon level={item} />
              <span>{levelLabel(item)}</span>
              <strong>{levelCounts[item] || 0}</strong>
            </button>
          ))}
        </div>
        <label className="console-search">
          <ActionIcon name="search" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrer source ou message"
            aria-label="Filtrer les logs"
          />
          <kbd>⌘F</kbd>
        </label>
      </div>

      {isPaused && (
        <div className="console-pause-banner" role="status">
          <span className="pause-pulse" />
          <strong>En pause</strong>
          <span>
            {` — ${pendingCount} événement${
              pendingCount > 1 ? "s" : ""
            } en attente`}
          </span>
        </div>
      )}

      <div className="console-table" style={tableStyle}>
        <div className="console-table-inner">
          <div className="console-table-header" role="row">
            {[
              ["time", "Heure"],
              ["level", "Niveau"],
              ["source", "Source"],
              ["message", "Message"],
            ].map(([column, label]) => (
              <div role="columnheader" key={column}>
                <span>{label}</span>
                <button
                  type="button"
                  className="column-resizer"
                  role="separator"
                  aria-label={`Redimensionner ${label}`}
                  aria-orientation="vertical"
                  aria-valuemin={COLUMN_LIMITS[column][0]}
                  aria-valuemax={COLUMN_LIMITS[column][1]}
                  aria-valuenow={columnWidths[column]}
                  onPointerDown={(event) => startColumnResize(column, event)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      resizeColumn(column, event.key === "ArrowLeft" ? -8 : 8);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <div className="console-log-rows" role="rowgroup">
            {visibleLogs.length === 0 ? (
              <div className="console-empty">
                <LevelIcon level={level === "all" ? "info" : level} />
                <p>Aucun événement à afficher.</p>
                <span>Console observe l’application ; Terminal exécute les commandes.</span>
              </div>
            ) : (
              visibleLogs.map((log, index) => (
                <div
                  className={`console-entry ${log.level}${
                    selectedLogId === log.id ? " selected" : ""
                  }`}
                  key={log.id}
                  data-testid="console-entry"
                  role="row"
                  tabIndex={0}
                  ref={(node) => {
                    if (node) rowRefs.current.set(log.id, node);
                    else rowRefs.current.delete(log.id);
                  }}
                  onClick={() => setSelectedLogId(log.id)}
                  onFocus={() => setSelectedLogId(log.id)}
                  onKeyDown={(event) => handleRowKeyDown(index, event)}
                >
                  <time role="cell" dateTime={log.timestamp.toISOString()}>
                    {log.timestamp.toLocaleTimeString("fr-FR")}
                  </time>
                  <span className="entry-level" role="cell">
                    <LevelIcon level={log.level} />
                    {log.level}
                  </span>
                  <strong role="cell">{log.source}</strong>
                  <p role="cell">{log.message}</p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      <form className="console-command" onSubmit={runCommand}>
        <span className="command-prefix">observer ›</span>
        <div className="command-field">
          <input
            ref={commandRef}
            value={command}
            onChange={(event) => {
              setCommand(event.target.value);
              setHistoryCursor(-1);
            }}
            onKeyDown={handleCommandKeyDown}
            placeholder="help · filter error · search window"
            aria-label="Commande d’observation Console"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={commandSuggestions.length > 0}
            aria-controls="console-command-suggestions"
            autoComplete="off"
          />
          {commandSuggestions.length > 0 && (
            <div
              className="command-suggestions"
              id="console-command-suggestions"
              role="listbox"
            >
              {commandSuggestions.map((suggestion, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={index === 0}
                  key={suggestion.name}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => completeCommand(suggestion)}
                >
                  <strong>{suggestion.name}</strong>
                  <span>{suggestion.detail}</span>
                  {index === 0 && <kbd>Tab</kbd>}
                </button>
              ))}
            </div>
          )}
        </div>
        <kbd>⌘K</kbd>
      </form>
    </section>
  );
}
