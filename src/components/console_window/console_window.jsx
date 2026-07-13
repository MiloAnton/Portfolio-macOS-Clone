import { useEffect, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MenuBar from "../menu_bar/menu_bar";
import version from "../../../package.json";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import {
  addPortfolioLog,
  clearPortfolioLogs,
  getPortfolioLogs,
  subscribeToPortfolioLogs,
} from "../../utils/portfolioLogger";
import "./console_window.scss";

const levels = ["all", "info", "success", "warning", "error"];

export default function ConsoleWindow(props) {
  const { position, handleDragStop } = usePersistentWindowPosition(
    "console",
    780,
    500
  );
  const [logs, setLogs] = useState(getPortfolioLogs);
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const pausedLogsRef = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    return subscribeToPortfolioLogs(
      (entry) => {
        if (isPaused) pausedLogsRef.current.push(entry);
        else setLogs((current) => [...current, entry]);
      },
      () => setLogs([])
    );
  }, [isPaused]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [logs]);

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

  const togglePause = () => {
    if (isPaused && pausedLogsRef.current.length > 0) {
      setLogs((current) => [...current, ...pausedLogsRef.current]);
      pausedLogsRef.current = [];
    }
    setIsPaused(!isPaused);
  };

  const runCommand = (event) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;
    addPortfolioLog("info", "console", `› ${input}`);
    const [name, ...args] = input.split(/\s+/);

    if (name === "clear") {
      clearPortfolioLogs();
    } else if (name === "help") {
      addPortfolioLog(
        "success",
        "console",
        "Commandes : help, clear, status, version, echo <texte>"
      );
    } else if (name === "status") {
      const openWindows = document.querySelectorAll(".window-container").length;
      addPortfolioLog(
        "success",
        "runtime",
        `${openWindows} fenêtre${openWindows > 1 ? "s" : ""} ouverte${
          openWindows > 1 ? "s" : ""
        } · React opérationnel`
      );
    } else if (name === "version") {
      addPortfolioLog("info", "portfolio", `Version ${version.version}`);
    } else if (name === "echo") {
      addPortfolioLog("info", "echo", args.join(" ") || "…");
    } else {
      addPortfolioLog("error", "console", `Commande inconnue : ${name}`);
    }
    setCommand("");
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App console-window ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={props.handleClickZIndex}
        width={780}
        height={500}
        minConstraints={[520, 320]}
        maxConstraints={[2560, 1440]}
        resizeHandles={["se"]}
      >
        <MenuBar
          title="Console"
          handleFullscreen={props.fullScreen}
          handleQuit={props.handleClose}
          handleMinimize={props.handleMinimize}
        />
        <div className="console-toolbar">
          <button type="button" onClick={togglePause} className={isPaused ? "paused" : ""}>
            {isPaused ? "▶ Reprendre" : "Ⅱ Pause"}
          </button>
          <button type="button" onClick={clearPortfolioLogs}>Effacer</button>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {levels.map((item) => (
              <option value={item} key={item}>{item === "all" ? "Tous les niveaux" : item}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrer"
            aria-label="Filtrer les logs"
          />
        </div>
        <div className="console-content">
          {visibleLogs.length === 0 ? (
            <div className="console-empty">
              <p>Aucun événement à afficher.</p>
              <span>Ouvre une app ou saisis `help` ci-dessous.</span>
            </div>
          ) : (
            visibleLogs.map((log) => (
              <div className={`console-entry ${log.level}`} key={log.id}>
                <time>{log.timestamp.toLocaleTimeString("fr-FR")}</time>
                <span className="level">{log.level}</span>
                <strong>{log.source}</strong>
                <p>{log.message}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <form className="console-command" onSubmit={runCommand}>
          <span>console ›</span>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="help"
            aria-label="Commande Console"
            autoComplete="off"
          />
        </form>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
