import { useMemo, useState } from "react";
import "./calendar_window.scss";

export const CALENDAR_STORAGE_KEY = "portfolio-calendar-events";
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const VIEWS = [
  ["day", "Jour"],
  ["week", "Semaine"],
  ["month", "Mois"],
  ["agenda", "Liste"],
];
export const EVENT_COLORS = ["blue", "purple", "orange", "green", "pink", "red"];
const COLOR_LABELS = {
  blue: "Bleu",
  purple: "Violet",
  orange: "Orange",
  green: "Vert",
  pink: "Rose",
  red: "Rouge",
};
let fallbackId = 0;

const createEventId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  fallbackId += 1;
  return `event-${Date.now()}-${fallbackId}`;
};

export const createLocalDate = (year, monthIndex, day) =>
  new Date(year, monthIndex, day, 12, 0, 0, 0);

export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;
  const day = Number(dayValue);
  const date = createLocalDate(year, monthIndex, day);
  return date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
    ? date
    : null;
};

const addLocalDays = (date, amount) =>
  createLocalDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);

export const startOfLocalWeek = (date) => {
  const mondayOffset = (date.getDay() + 6) % 7;
  return addLocalDays(date, -mondayOffset);
};

export const buildWeekDates = (date) => {
  const weekStart = startOfLocalWeek(date);
  return Array.from({ length: 7 }, (_, index) => addLocalDays(weekStart, index));
};

export const buildMonthCells = (visibleMonth) => {
  const firstDay = createLocalDate(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addLocalDays(firstDay, -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addLocalDays(gridStart, index));
};

const createDefaultEvents = () => {
  const today = new Date();
  const tomorrow = addLocalDays(today, 1);
  return [
    {
      id: createEventId(),
      date: toDateKey(today),
      title: "Explorer le portfolio",
      time: "10:00",
      description: "Découvrir les applications et les projets de Milo.",
      color: "blue",
    },
    {
      id: createEventId(),
      date: toDateKey(today),
      title: "Tester le Terminal",
      time: "14:30",
      description: "Essayer la commande help pour commencer.",
      color: "purple",
    },
    {
      id: createEventId(),
      date: toDateKey(tomorrow),
      title: "Télécharger le CV",
      time: "09:00",
      description: "Le fichier CV.pdf se trouve directement sur le bureau.",
      color: "orange",
    },
  ];
};

const normalizeEvent = (event) => {
  if (
    !event ||
    !["string", "number"].includes(typeof event.id) ||
    typeof event.title !== "string" ||
    !event.title.trim() ||
    !parseDateKey(event.date)
  ) {
    return null;
  }

  return {
    id: event.id,
    date: event.date,
    title: event.title.trim(),
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time) ? event.time : "",
    description: typeof event.description === "string" ? event.description : "",
    color: EVENT_COLORS.includes(event.color) ? event.color : "blue",
  };
};

export const loadEvents = () => {
  try {
    const serializedEvents = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (serializedEvents === null) return createDefaultEvents();
    const storedEvents = JSON.parse(serializedEvents);
    if (!Array.isArray(storedEvents)) return createDefaultEvents();
    return storedEvents.map(normalizeEvent).filter(Boolean);
  } catch (error) {
    return createDefaultEvents();
  }
};

const saveEvents = (events) => {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    // Le calendrier reste utilisable si le stockage local est indisponible.
  }
};

export const indexEventsByDate = (events) => {
  const index = new Map();
  events.forEach((event) => {
    const eventsForDay = index.get(event.date) || [];
    eventsForDay.push(event);
    index.set(event.date, eventsForDay);
  });
  index.forEach((eventsForDay) => {
    eventsForDay.sort((firstEvent, secondEvent) =>
      (firstEvent.time || "24:00").localeCompare(secondEvent.time || "24:00")
    );
  });
  return index;
};

const createDraft = () => ({
  title: "",
  time: "09:00",
  description: "",
  color: "blue",
});

const formatLongDate = (date) =>
  date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatWeekTitle = (date) => {
  const [weekStart, , , , , , weekEnd] = buildWeekDates(date);
  const startDay = weekStart.toLocaleDateString("fr-FR", { day: "numeric" });
  const endDay = weekEnd.toLocaleDateString("fr-FR", { day: "numeric" });
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
  const startMonth = weekStart.toLocaleDateString("fr-FR", { month: "long" });
  const endMonth = weekEnd.toLocaleDateString("fr-FR", { month: "long" });

  if (sameMonth && sameYear) {
    return `${startDay}–${endDay} ${endMonth} ${weekEnd.getFullYear()}`;
  }
  if (sameYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${weekEnd.getFullYear()}`;
  }
  return `${startDay} ${startMonth} ${weekStart.getFullYear()} – ${endDay} ${endMonth} ${weekEnd.getFullYear()}`;
};

function ChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={direction === "left" ? "m10 3-5 5 5 5" : "m6 3 5 5-5 5"} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m10.8 2.2 3 3L5.3 13.7 2 14l.3-3.3Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 4.5h10M6 4.5V3h4v1.5M12 4.5 11.4 14H4.6L4 4.5" />
    </svg>
  );
}

function ScheduleEvent({ calendarEvent, onEdit }) {
  return (
    <button
      type="button"
      className={`schedule-event ${calendarEvent.color}`}
      onClick={() => onEdit(calendarEvent)}
      aria-label={`Modifier ${calendarEvent.title}`}
    >
      <i />
      <span>
        <strong>{calendarEvent.title}</strong>
        <small>{calendarEvent.description || "Sans description"}</small>
      </span>
      <time>{calendarEvent.time || "Toute la journée"}</time>
    </button>
  );
}

export default function CalendarWindow() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    createLocalDate(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [events, setEvents] = useState(loadEvents);
  const [view, setView] = useState("month");
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(createDraft);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const cells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const eventsByDate = useMemo(() => indexEventsByDate(events), [events]);
  const selectedDateObject = parseDateKey(selectedDate) || today;
  const selectedEvents = eventsByDate.get(selectedDate) || [];
  const weekDates = useMemo(
    () => buildWeekDates(parseDateKey(selectedDate) || today),
    [selectedDate, today]
  );
  const chronologicalEvents = useMemo(
    () =>
      [...events].sort((firstEvent, secondEvent) => {
        const dateComparison = firstEvent.date.localeCompare(secondEvent.date);
        if (dateComparison !== 0) return dateComparison;
        return (firstEvent.time || "24:00").localeCompare(
          secondEvent.time || "24:00"
        );
      }),
    [events]
  );

  const monthTitle = visibleMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const viewTitle = {
    day: formatLongDate(selectedDateObject),
    week: formatWeekTitle(selectedDateObject),
    month: monthTitle,
    agenda: "Programme",
  }[view];
  const periodLabels = {
    day: ["Jour précédent", "Jour suivant"],
    week: ["Semaine précédente", "Semaine suivante"],
    month: ["Mois précédent", "Mois suivant"],
    agenda: ["Période précédente", "Période suivante"],
  }[view];

  const persistEvents = (nextEvents) => {
    setEvents(nextEvents);
    saveEvents(nextEvents);
  };

  const changePeriod = (offset) => {
    if (view === "agenda") return;
    if (view === "month") {
      setVisibleMonth(createLocalDate(year, month + offset, 1));
      return;
    }

    const dayOffset = view === "week" ? offset * 7 : offset;
    const nextDate = addLocalDays(selectedDateObject, dayOffset);
    setSelectedDate(toDateKey(nextDate));
    setVisibleMonth(createLocalDate(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const goToday = () => {
    setVisibleMonth(createLocalDate(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const selectDate = (date) => {
    const dateKey = toDateKey(date);
    setSelectedDate(dateKey);
    if (date.getMonth() !== month || date.getFullYear() !== year) {
      setVisibleMonth(createLocalDate(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const openCreateEditor = (dateKey = selectedDate) => {
    setSelectedDate(dateKey);
    setDraft(createDraft());
    setEditor({ mode: "create", eventId: null });
  };

  const openEditEditor = (calendarEvent) => {
    setSelectedDate(calendarEvent.date);
    setDraft({
      title: calendarEvent.title,
      time: calendarEvent.time,
      description: calendarEvent.description,
      color: calendarEvent.color,
    });
    setEditor({ mode: "edit", eventId: calendarEvent.id });
  };

  const closeEditor = () => {
    setEditor(null);
    setDraft(createDraft());
  };

  const submitEvent = (event) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title || !parseDateKey(selectedDate)) return;

    if (editor?.mode === "edit") {
      persistEvents(
        events.map((calendarEvent) =>
          calendarEvent.id === editor.eventId
            ? { ...calendarEvent, ...draft, title, date: selectedDate }
            : calendarEvent
        )
      );
    } else {
      persistEvents([
        ...events,
        {
          id: createEventId(),
          date: selectedDate,
          ...draft,
          title,
        },
      ]);
    }
    closeEditor();
  };

  const removeEvent = (eventId) => {
    persistEvents(events.filter((calendarEvent) => calendarEvent.id !== eventId));
    if (editor?.eventId === eventId) closeEditor();
  };

  const showEventInMonth = (calendarEvent) => {
    const eventDate = parseDateKey(calendarEvent.date);
    if (!eventDate) return;
    setSelectedDate(calendarEvent.date);
    setVisibleMonth(createLocalDate(eventDate.getFullYear(), eventDate.getMonth(), 1));
    setView("month");
  };

  return (
    <div className="calendar-app">
      <header className="calendar-header">
        <div className="calendar-navigation">
          <button
            type="button"
            onClick={() => changePeriod(-1)}
            aria-label={periodLabels[0]}
            disabled={view === "agenda"}
          >
            <ChevronIcon direction="left" />
          </button>
          <button type="button" onClick={goToday}>Aujourd’hui</button>
          <button
            type="button"
            onClick={() => changePeriod(1)}
            aria-label={periodLabels[1]}
            disabled={view === "agenda"}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        <h2>{viewTitle}</h2>

        <div className="calendar-view-switch" aria-label="Vue du calendrier">
          {VIEWS.map(([id, label]) => (
            <button
              type="button"
              className={view === id ? "active" : ""}
              aria-pressed={view === id}
              onClick={() => setView(id)}
              key={id}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="calendar-body">
        {view === "day" ? (
          <section className="calendar-day-view" aria-label={`Vue du ${formatLongDate(selectedDateObject)}`}>
            <div className="schedule-heading">
              <div className={`schedule-date-badge${selectedDate === todayKey ? " today" : ""}`}>
                <span>{selectedDateObject.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                <strong>{selectedDateObject.getDate()}</strong>
              </div>
              <div>
                <span>Journée</span>
                <h3>{formatLongDate(selectedDateObject)}</h3>
                <p>{selectedEvents.length} événement{selectedEvents.length > 1 ? "s" : ""}</p>
              </div>
              <button type="button" onClick={() => openCreateEditor()}>
                <PlusIcon /> Ajouter
              </button>
            </div>
            <div className="day-schedule">
              <span className="schedule-gutter">Heure</span>
              <div className="schedule-event-list">
                {selectedEvents.length ? (
                  selectedEvents.map((item) => (
                    <ScheduleEvent
                      calendarEvent={item}
                      onEdit={openEditEditor}
                      key={item.id}
                    />
                  ))
                ) : (
                  <button type="button" className="schedule-empty" onClick={() => openCreateEditor()}>
                    <PlusIcon />
                    <span>Aucun événement — cliquer pour en créer un</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : view === "week" ? (
          <section className="calendar-week-view" aria-label={`Semaine du ${formatLongDate(weekDates[0])}`}>
            <div className="week-grid">
              {weekDates.map((date) => {
                const dateKey = toDateKey(date);
                const dayEvents = eventsByDate.get(dateKey) || [];
                const isToday = dateKey === todayKey;
                return (
                  <div className={`week-column${isToday ? " today" : ""}`} key={dateKey}>
                    <div className="week-day-heading">
                      <button type="button" onClick={() => setSelectedDate(dateKey)}>
                        <span>{date.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                        <strong>{date.getDate()}</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateEditor(dateKey)}
                        aria-label={`Ajouter un événement le ${formatLongDate(date)}`}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <div className="week-events">
                      {dayEvents.length ? (
                        dayEvents.map((item) => (
                          <ScheduleEvent
                            calendarEvent={item}
                            onEdit={openEditEditor}
                            key={item.id}
                          />
                        ))
                      ) : (
                        <span className="week-empty">Aucun événement</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : view === "month" ? (
          <section className="month-view" aria-label={monthTitle}>
            <div className="weekday-row" aria-hidden="true">
              {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-grid">
              {cells.map((date) => {
                const dateKey = toDateKey(date);
                const dayEvents = eventsByDate.get(dateKey) || [];
                const outsideMonth = date.getMonth() !== month;
                const isToday = dateKey === todayKey;
                return (
                  <button
                    type="button"
                    className={`calendar-day${selectedDate === dateKey ? " selected" : ""}${isToday ? " today" : ""}${outsideMonth ? " outside-month" : ""}`}
                    onClick={() => selectDate(date)}
                    onDoubleClick={() => openCreateEditor(dateKey)}
                    aria-label={`${formatLongDate(date)}${dayEvents.length ? `, ${dayEvents.length} événement${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                    key={dateKey}
                  >
                    <span className="day-number">{date.getDate()}</span>
                    <span className="day-events">
                      {dayEvents.slice(0, 3).map((item) => (
                        <span className={`event-pill ${item.color}`} key={item.id}>
                          <i />
                          {item.time && <time>{item.time}</time>}
                          <b>{item.title}</b>
                        </span>
                      ))}
                      {dayEvents.length > 3 && <small>+{dayEvents.length - 3} autres</small>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="calendar-agenda" aria-label="Liste chronologique des événements">
            <div className="agenda-heading">
              <div>
                <span>Calendrier</span>
                <h3>Programme</h3>
              </div>
              <strong>{events.length} événement{events.length > 1 ? "s" : ""}</strong>
            </div>
            {chronologicalEvents.length ? (
              <div className="agenda-list">
                {chronologicalEvents.map((item) => {
                  const eventDate = parseDateKey(item.date);
                  const isPast = item.date < todayKey;
                  return (
                    <button
                      type="button"
                      className={`agenda-event${isPast ? " past" : ""}`}
                      onClick={() => showEventInMonth(item)}
                      key={item.id}
                    >
                      <span className="agenda-date">
                        <b>{eventDate.toLocaleDateString("fr-FR", { day: "2-digit" })}</b>
                        <span>{eventDate.toLocaleDateString("fr-FR", { month: "short" })}</span>
                      </span>
                      <i className={item.color} />
                      <span className="agenda-copy">
                        <strong>{item.title}</strong>
                        <span>{item.description || "Sans description"}</span>
                      </span>
                      <time>{item.time || "Toute la journée"}</time>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="agenda-empty">Aucun événement à afficher.</div>
            )}
          </section>
        )}

        <aside className="calendar-inspector">
          <div className="inspector-date">
            <p>{selectedDateObject.toLocaleDateString("fr-FR", { weekday: "long" })}</p>
            <strong>{selectedDateObject.getDate()}</strong>
            <span>{selectedDateObject.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
          </div>

          {!editor ? (
            <>
              <div className="inspector-title">
                <h3>Événements</h3>
                <button type="button" onClick={() => openCreateEditor()} aria-label="Ajouter un événement">
                  <PlusIcon />
                </button>
              </div>
              <div className="selected-events">
                {selectedEvents.length === 0 ? (
                  <div className="no-event">
                    <span>Aucun événement</span>
                    <button type="button" onClick={() => openCreateEditor()}>Créer un événement</button>
                  </div>
                ) : selectedEvents.map((item) => (
                  <article className={`inspector-event ${item.color}`} key={item.id}>
                    <i />
                    <div>
                      <p>{item.title}</p>
                      <time>{item.time || "Toute la journée"}</time>
                      {item.description && <span>{item.description}</span>}
                    </div>
                    <div className="event-actions">
                      <button type="button" onClick={() => openEditEditor(item)} aria-label={`Modifier ${item.title}`}>
                        <PencilIcon />
                      </button>
                      <button type="button" onClick={() => removeEvent(item.id)} aria-label={`Supprimer ${item.title}`}>
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="storage-note">Sauvegardé dans ce navigateur</p>
            </>
          ) : (
            <form className="event-editor" onSubmit={submitEvent}>
              <div className="event-editor-heading">
                <h3>{editor.mode === "edit" ? "Modifier l’événement" : "Nouvel événement"}</h3>
                <span>{formatLongDate(selectedDateObject)}</span>
              </div>

              <label>
                <span>Titre</span>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Nom de l’événement"
                  maxLength={70}
                />
              </label>

              <label>
                <span>Heure</span>
                <input
                  type="time"
                  value={draft.time}
                  onChange={(event) => setDraft({ ...draft, time: event.target.value })}
                />
              </label>

              <fieldset>
                <legend>Couleur</legend>
                <div className="event-colors">
                  {EVENT_COLORS.map((color) => (
                    <label className={color} key={color}>
                      <input
                        type="radio"
                        name="event-color"
                        value={color}
                        checked={draft.color === color}
                        onChange={() => setDraft({ ...draft, color })}
                      />
                      <span aria-hidden="true" />
                      <b>{COLOR_LABELS[color]}</b>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label>
                <span>Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Ajouter des détails"
                  maxLength={240}
                />
              </label>

              <div className="event-editor-actions">
                <button type="button" onClick={closeEditor}>Annuler</button>
                <button type="submit" disabled={!draft.title.trim()}>
                  {editor.mode === "edit" ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
