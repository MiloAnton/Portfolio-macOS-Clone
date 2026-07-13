import "./dock.scss";
import { useEffect } from "react";
import { DOCK_WINDOWS } from "../../config/windowRegistry";

export default function Dock(props) {
  // Ajoute le point "app ouverte" sous l'icône, comme sur macOS.
  const openClass = (appId) => (props.windows?.[appId]?.isOpen ? " open" : "");
  const today = new Date();
  const calendarMonth = today
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  useEffect(() => {
    const icons = Array.from(document.querySelectorAll(".dock .ico"));
    const reset = () => icons.forEach((icon) => {
      icon.style.transform = "scale(1) translateY(0px)";
    });
    const handlers = icons.map((icon, index) => {
      const focus = () => {
        icon.style.transform = "scale(1.5) translateY(-10px)";
        [
          [index - 1, "scale(1.2) translateY(-6px)"],
          [index + 1, "scale(1.2) translateY(-6px)"],
          [index - 2, "scale(1.1)"],
          [index + 2, "scale(1.1)"],
        ].forEach(([neighbourIndex, transform]) => {
          if (icons[neighbourIndex]) icons[neighbourIndex].style.transform = transform;
        });
      };
      icon.addEventListener("mouseenter", focus);
      icon.addEventListener("mouseleave", reset);
      return { icon, focus };
    });
    return () => handlers.forEach(({ icon, focus }) => {
      icon.removeEventListener("mouseenter", focus);
      icon.removeEventListener("mouseleave", reset);
    });
  }, []);

  return (
    <div className="dock">
      <div className="dock-container">
        {DOCK_WINDOWS.map((windowConfig) => (
          <li
            className={`dock-item${openClass(windowConfig.id)}`}
            onClick={() => props.onToggle(windowConfig.id)}
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
