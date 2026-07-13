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
  return (
    <div className="dock">
      <div className="dock-container">
        {DOCK_WINDOWS.map((windowConfig, index) => (
          <li
            className={`dock-item${openClass(windowConfig.id)}${hoverClass(index)}`}
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
          </li>
        ))}
      </div>
    </div>
  );
}
