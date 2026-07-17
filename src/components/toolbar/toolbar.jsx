import "./toolbar.scss";
import heart from "./../../assets/heart.svg";
import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/language";
import { EN_APP_LABELS } from "../../i18n/content.en";

const COPY = {
  fr: {
    locale: "fr-FR",
    menus: { stack: "Stack", pro: "Pro", education: "Formation", projects: "Projets" },
    switchLabel: "Switch to English",
    switchText: "EN",
  },
  en: {
    locale: "en-GB",
    menus: { stack: "Stack", pro: "Work", education: "Education", projects: "Projects" },
    switchLabel: "Passer en français",
    switchText: "FR",
  },
};

const BluetoothIcon = () => (
  <svg viewBox="0 0 16 20" aria-hidden="true">
    <path d="M7.5 1.5v17l5-4.5-9-8 9 8-5 4.5m0-17 5 4.5-9 8" />
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 26 13" aria-hidden="true">
    <rect x="1" y="1" width="21" height="11" rx="2.5" />
    <path d="M24 4.5v4" />
    <rect className="battery-level" x="3" y="3" width="17" height="7" rx="1" />
  </svg>
);

export default function Toolbar(props) {
  const [current, setCurrent] = useState(() => new Date());
  const { language, toggleLanguage } = useLanguage();
  const copy = COPY[language];

  useEffect(() => {
    const clock = setInterval(() => setCurrent(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Format macOS : "jeu. 10 juil." (et la date complète en tooltip).
  const date = current.toLocaleDateString(copy.locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const fullDate = current.toLocaleDateString(copy.locale, { dateStyle: "full" });
  const time = current.toLocaleTimeString(copy.locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fullTime = current.toLocaleTimeString(copy.locale);
  const focusedWindow = props.focusedWindow;
  const focusedLabel =
    focusedWindow &&
    (language === "en"
      ? EN_APP_LABELS[focusedWindow.id] || focusedWindow.label
      : focusedWindow.label);

  return (
    <section className="toolbar">
      <div className="menus">
        <img
          src={heart}
          height="20px"
          title="Développé avec amour par Milo Anton Roche-Vandenbroucque"
          alt="Icône de coeur"
        />
        <a href="#perso" title="Scroll vers la présentation">
          <p>
            <b>Milo</b>
          </p>
        </a>
        {focusedWindow?.id === "main" ? (
          <>
            <a href="#stack">
              <p>{copy.menus.stack}</p>
            </a>
            <a href="#pro">
              <p>{copy.menus.pro}</p>
            </a>
            <a href="#education">
              <p>{copy.menus.education}</p>
            </a>
          </>
        ) : focusedWindow?.id === "projects" ? (
          <a href="#projects">
            <p>{copy.menus.projects}</p>
          </a>
        ) : focusedWindow ? (
          <p>{focusedLabel}</p>
        ) : null}
      </div>
      <div className="icons">
        <button
          type="button"
          className="language-switch"
          aria-label={copy.switchLabel}
          title={copy.switchLabel}
          onClick={toggleLanguage}
        >
          {copy.switchText}
        </button>
        <div className="status-icon bluetooth-icon" title="Bluetooth activé">
          <BluetoothIcon />
        </div>
        <div className="status-icon battery-icon" title="Batterie : 95 %">
          <BatteryIcon />
        </div>
        <div className="date-time">
          <p title={fullDate}>{date}</p>
          <p title={`${fullTime}`}>{time}</p>
        </div>
      </div>
    </section>
  );
}
