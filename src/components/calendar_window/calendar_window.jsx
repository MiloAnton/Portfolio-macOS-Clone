import { useMemo, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MenuBar from "../menu_bar/menu_bar";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import "./calendar_window.scss";

const STORAGE_KEY = "portfolio-calendar-events";
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDefaultEvents = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return [
    { id: 1, date: toDateKey(today), title: "Explorer le portfolio", color: "blue" },
    { id: 2, date: toDateKey(today), title: "Tester le Terminal", color: "purple" },
    { id: 3, date: toDateKey(tomorrow), title: "Télécharger le CV", color: "orange" },
  ];
};

const loadEvents = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    // Le calendrier reste utilisable sans stockage local.
  }
  return createDefaultEvents();
};

const saveEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    // Le stockage peut être désactivé par le navigateur.
  }
};

export default function CalendarWindow(props) {
  const { position, handleDragStop } = usePersistentWindowPosition(
    "calendar",
    840,
    590
  );
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [events, setEvents] = useState(loadEvents);
  const [newEvent, setNewEvent] = useState("");

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [
    ...Array(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0 || cells.length < 35) cells.push(null);

  const monthTitle = visibleMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
  const selectedEvents = events.filter((event) => event.date === selectedDate);

  const changeMonth = (offset) => {
    setVisibleMonth(new Date(year, month + offset, 1));
  };

  const goToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toDateKey(today));
  };

  const addEvent = (event) => {
    event.preventDefault();
    const title = newEvent.trim();
    if (!title) return;
    const nextEvents = [
      ...events,
      { id: Date.now(), date: selectedDate, title, color: "blue" },
    ];
    setEvents(nextEvents);
    saveEvents(nextEvents);
    setNewEvent("");
  };

  const removeEvent = (id) => {
    const nextEvents = events.filter((event) => event.id !== id);
    setEvents(nextEvents);
    saveEvents(nextEvents);
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App calendar-window ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={props.handleClickZIndex}
        width={840}
        height={590}
        minConstraints={[620, 450]}
        maxConstraints={[1500, 1000]}
        resizeHandles={["se"]}
      >
        <MenuBar
          title="Calendrier"
          handleFullscreen={props.fullScreen}
          handleQuit={props.handleClose}
          handleMinimize={props.handleMinimize}
        />
        <div className="calendar-app">
          <header className="calendar-header">
            <div className="calendar-navigation">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Mois précédent">‹</button>
              <button type="button" onClick={goToday}>Aujourd’hui</button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Mois suivant">›</button>
            </div>
            <h2>{monthTitle}</h2>
            <span>{events.length} événement{events.length > 1 ? "s" : ""}</span>
          </header>

          <div className="calendar-body">
            <section className="month-view">
              <div className="weekday-row">
                {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="calendar-grid">
                {cells.map((day, index) => {
                  if (!day) return <div className="empty-day" key={`empty-${index}`} />;
                  const date = new Date(year, month, day);
                  const dateKey = toDateKey(date);
                  const dayEvents = events.filter((event) => event.date === dateKey);
                  const isToday = dateKey === toDateKey(today);
                  return (
                    <button
                      type="button"
                      className={`${selectedDate === dateKey ? "selected" : ""} ${isToday ? "today" : ""}`}
                      onClick={() => setSelectedDate(dateKey)}
                      key={dateKey}
                    >
                      <span className="day-number">{day}</span>
                      <div className="day-events">
                        {dayEvents.slice(0, 2).map((item) => (
                          <span className={item.color} key={item.id}>{item.title}</span>
                        ))}
                        {dayEvents.length > 2 && <small>+{dayEvents.length - 2}</small>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="calendar-inspector">
              <p className="inspector-day">{selectedDateObject.toLocaleDateString("fr-FR", { weekday: "long" })}</p>
              <strong>{selectedDateObject.getDate()}</strong>
              <span>{selectedDateObject.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
              <div className="selected-events">
                {selectedEvents.length === 0 ? (
                  <p className="no-event">Aucun événement</p>
                ) : selectedEvents.map((item) => (
                  <div className="inspector-event" key={item.id}>
                    <i className={item.color} />
                    <p>{item.title}</p>
                    <button type="button" onClick={() => removeEvent(item.id)} aria-label={`Supprimer ${item.title}`}>×</button>
                  </div>
                ))}
              </div>
              <form onSubmit={addEvent}>
                <input value={newEvent} onChange={(event) => setNewEvent(event.target.value)} placeholder="Nouvel événement" maxLength={70} />
                <button type="submit" disabled={!newEvent.trim()}>+</button>
              </form>
              <p className="storage-note">Sauvegardé dans ce navigateur</p>
            </aside>
          </div>
        </div>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
