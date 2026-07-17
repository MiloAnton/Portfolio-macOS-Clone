import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import CalendarWindow, {
  buildMonthCells,
  buildWeekDates,
  CALENDAR_STORAGE_KEY,
  createLocalDate,
  formatWeekTitle,
  indexEventsByDate,
  loadEvents,
  parseDateKey,
  toDateKey,
} from "./calendar_window";

const STORED_EVENTS = [
  {
    id: "morning",
    date: "2026-07-16",
    title: "Petit déjeuner",
    time: "08:30",
    description: "Café avec Milo",
    color: "orange",
  },
  {
    id: "meeting",
    date: "2026-07-16",
    title: "Réunion projet",
    time: "14:00",
    description: "Préparer la démonstration",
    color: "purple",
  },
  {
    id: "tomorrow",
    date: "2026-07-17",
    title: "Déploiement",
    time: "10:15",
    description: "Mettre la nouvelle version en ligne",
    color: "green",
  },
];

describe("CalendarWindow", () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date(2026, 6, 16, 12));
    localStorage.clear();
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(STORED_EVENTS));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("builds a stable six-week grid including adjacent months", () => {
    const cells = buildMonthCells(createLocalDate(2026, 6, 1));

    expect(cells).toHaveLength(42);
    expect(toDateKey(cells[0])).toBe("2026-06-29");
    expect(toDateKey(cells[41])).toBe("2026-08-09");

    render(<CalendarWindow />);
    expect(screen.getByRole("button", { name: /lundi 29 juin 2026/i })).toHaveClass(
      "outside-month"
    );
    expect(screen.getByRole("button", { name: /samedi 1 août 2026/i })).toHaveClass(
      "outside-month"
    );
  });

  it("parses only valid local date keys and remains stable across DST boundaries", () => {
    expect(parseDateKey("2026-02-29")).toBeNull();
    expect(parseDateKey("not-a-date")).toBeNull();
    expect(toDateKey(parseDateKey("2026-03-29"))).toBe("2026-03-29");
    expect(toDateKey(parseDateKey("2026-10-25"))).toBe("2026-10-25");
  });

  it("migrates legacy events while loading localStorage only once", () => {
    localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify([{ id: 1, date: "2026-07-16", title: "Ancien", color: "blue" }])
    );
    const storageSpy = vi.spyOn(Storage.prototype, "getItem");

    render(<CalendarWindow />);

    expect(storageSpy).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Ancien")).toHaveLength(2);
    expect(loadEvents()[0]).toMatchObject({ time: "", description: "" });
  });

  it("indexes and sorts events once per date", () => {
    const index = indexEventsByDate(STORED_EVENTS);

    expect(index.size).toBe(2);
    expect(index.get("2026-07-16").map((event) => event.id)).toEqual([
      "morning",
      "meeting",
    ]);
  });

  it("creates an event with time, color and description from a day double-click", () => {
    render(<CalendarWindow />);
    fireEvent.doubleClick(screen.getByRole("button", { name: /samedi 18 juillet 2026/i }));

    fireEvent.change(screen.getByLabelText("Titre"), {
      target: { value: "Déjeuner" },
    });
    fireEvent.change(screen.getByLabelText("Heure"), { target: { value: "12:45" } });
    fireEvent.click(screen.getByLabelText("Vert"));
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Terrasse avec l’équipe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    const stored = JSON.parse(localStorage.getItem(CALENDAR_STORAGE_KEY));
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: "2026-07-18",
          title: "Déjeuner",
          time: "12:45",
          color: "green",
          description: "Terrasse avec l’équipe",
        }),
      ])
    );
    expect(screen.getAllByText("Déjeuner")).toHaveLength(2);
  });

  it("edits every event field instead of only allowing deletion", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Modifier Réunion projet" }));

    const titleInput = screen.getByLabelText("Titre");
    fireEvent.change(titleInput, { target: { value: "Revue finale" } });
    fireEvent.change(screen.getByLabelText("Heure"), { target: { value: "15:30" } });
    fireEvent.click(screen.getByLabelText("Rose"));
    const description = screen.getByLabelText("Description");
    fireEvent.change(description, {
      target: { value: "Validation avant publication" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    const updated = JSON.parse(localStorage.getItem(CALENDAR_STORAGE_KEY)).find(
      (event) => event.id === "meeting"
    );
    expect(updated).toMatchObject({
      title: "Revue finale",
      time: "15:30",
      color: "pink",
      description: "Validation avant publication",
    });
    expect(screen.getAllByText("Revue finale")).toHaveLength(2);
  });

  it("keeps deletion available beside the edit action", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Supprimer Réunion projet" }));

    expect(screen.queryByText("Réunion projet")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CALENDAR_STORAGE_KEY))).toHaveLength(2);
  });

  it("shows a chronological list with dates, descriptions and times", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Liste" }));

    const agenda = screen.getByRole("region", {
      name: "Liste chronologique des événements",
    });
    const agendaEvents = within(agenda).getAllByRole("button");
    expect(agendaEvents.map((event) => event.textContent)).toEqual([
      expect.stringContaining("Petit déjeuner"),
      expect.stringContaining("Réunion projet"),
      expect.stringContaining("Déploiement"),
    ]);
    expect(within(agenda).getByText("Préparer la démonstration")).toBeInTheDocument();
    expect(within(agenda).getByText("14:00")).toBeInTheDocument();
  });

  it("returns to the current day from another month", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Mois suivant" }));
    expect(screen.getByRole("heading", { name: "août 2026" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aujourd’hui" }));
    expect(screen.getByRole("heading", { name: "juillet 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jeudi 16 juillet 2026/i })).toHaveClass(
      "selected",
      "today"
    );
  });

  it("builds Monday-to-Sunday weeks safely across month and year boundaries", () => {
    const decemberWeek = buildWeekDates(createLocalDate(2026, 11, 31));

    expect(decemberWeek.map(toDateKey)).toEqual([
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
    expect(formatWeekTitle(createLocalDate(2026, 11, 31))).toBe(
      "28 décembre 2026 – 3 janvier 2027"
    );
  });

  it("shows a navigable day view and opens an event for editing", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Jour" }));

    const dayView = screen.getByRole("region", {
      name: /vue du jeudi 16 juillet 2026/i,
    });
    expect(within(dayView).getByText("Petit déjeuner")).toBeInTheDocument();
    expect(within(dayView).getByText("08:30")).toBeInTheDocument();

    fireEvent.click(within(dayView).getByRole("button", { name: "Modifier Petit déjeuner" }));
    expect(screen.getByRole("heading", { name: "Modifier l’événement" })).toBeInTheDocument();
  });

  it("moves one date at a time in day view and keeps Today in that view", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Jour" }));
    fireEvent.click(screen.getByRole("button", { name: "Jour suivant" }));

    expect(screen.getByRole("heading", { level: 2, name: /vendredi 17 juillet 2026/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /vue du vendredi 17 juillet 2026/i })).toHaveTextContent(
      "Déploiement"
    );

    fireEvent.click(screen.getByRole("button", { name: "Aujourd’hui" }));
    expect(screen.getByRole("heading", { level: 2, name: /jeudi 16 juillet 2026/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jour" })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders seven week columns and navigates by complete weeks", () => {
    render(<CalendarWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Semaine" }));

    const weekView = screen.getByRole("region", {
      name: /semaine du lundi 13 juillet 2026/i,
    });
    expect(
      within(weekView).getAllByRole("button", { name: /ajouter un événement le/i })
    ).toHaveLength(7);
    expect(within(weekView).getByText("Déploiement")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Semaine suivante" }));
    expect(screen.getByRole("heading", { name: "20–26 juillet 2026" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /semaine du lundi 20 juillet 2026/i })).toBeInTheDocument();
  });
});
