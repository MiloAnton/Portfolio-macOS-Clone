import "./dock.scss";
import { useState } from "react";
import { DOCK_WINDOWS } from "../../config/windowRegistry";

export default function Dock(props) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // Ajoute le point "app ouverte" sous l'icône, comme sur macOS.
  const openClass = (appId) => (props.windows?.[appId]?.isOpen ? " open" : "");
  const hoverClass = (index) => {
    if (hoveredIndex === null) return "";
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return " dock-hovered";
    if (distance === 1) return " dock-neighbour-1";
    if (distance === 2) return " dock-neighbour-2";
    return "";
  };
  const today = new Date();
  const calendarMonth = today
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  // Navigation clavier façon toolbar : ← → déplacent le focus entre les apps.
  const handleKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const buttons = [...event.currentTarget.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);
    if (index === -1) return;
    const step = event.key === "ArrowRight" ? 1 : buttons.length - 1;
    buttons[(index + step) % buttons.length].focus();
  };

  return (
    <div className="dock">
      <div
        className="dock-container"
        role="toolbar"
        aria-label="Dock"
        onKeyDown={handleKeyDown}
      >
        {DOCK_WINDOWS.map((windowConfig, index) => (
          <button
            type="button"
            className={`dock-item${openClass(windowConfig.id)}${hoverClass(index)}`}
            aria-label={windowConfig.label}
            onClick={() => props.onToggle(windowConfig.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            key={windowConfig.id}
          >
            <div className="name">{windowConfig.label}</div>
            {windowConfig.dockIconType === "calendar" ? (
              <div className="ico calendar-dock-icon" aria-hidden="true">
                <span>{calendarMonth}</span>
                <strong>{today.getDate()}</strong>
              </div>
            ) : (
              <img
                className={`ico${
                  windowConfig.dockIconClass
                    ? ` ${windowConfig.dockIconClass}`
                    : ""
                }`}
                src={windowConfig.dockIcon}
                alt=""
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
