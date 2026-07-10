const EVENT_NAME = "portfolio:log";
const MAX_LOGS = 250;
let nextId = 1;
let history = [];

export const addPortfolioLog = (level, source, message) => {
  const entry = {
    id: nextId++,
    level,
    source,
    message,
    timestamp: new Date(),
  };
  history = [...history, entry].slice(-MAX_LOGS);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: entry }));
  return entry;
};

export const getPortfolioLogs = () => [...history];

export const clearPortfolioLogs = () => {
  history = [];
  window.dispatchEvent(new CustomEvent(`${EVENT_NAME}:clear`));
};

export const subscribeToPortfolioLogs = (onLog, onClear) => {
  const handleLog = (event) => onLog(event.detail);
  window.addEventListener(EVENT_NAME, handleLog);
  window.addEventListener(`${EVENT_NAME}:clear`, onClear);
  return () => {
    window.removeEventListener(EVENT_NAME, handleLog);
    window.removeEventListener(`${EVENT_NAME}:clear`, onClear);
  };
};
