import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotesWindow, {
  NOTES_SAVE_DELAY,
  NOTES_STORAGE_KEY,
} from "./notes_window";

const createNote = ({
  id,
  title,
  body = "Corps de la note",
  updatedAt,
  pinned = false,
  color,
}) => ({
  id,
  content: `${title}\n${body}`,
  updatedAt,
  pinned,
  ...(color ? { color } : {}),
});

const seedNotes = (notes) => {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

describe("NotesWindow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00.000Z"));
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("loads and migrates stored notes exactly once while rendering real buttons", () => {
    seedNotes([
      {
        id: 1,
        content: "Ancienne note\nContenu conservé",
        updatedAt: 100,
      },
    ]);
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    render(<NotesWindow />);

    expect(
      getItem.mock.calls.filter(([key]) => key === NOTES_STORAGE_KEY)
    ).toHaveLength(1);
    const noteButton = screen.getByRole("button", {
      name: "Ouvrir la note Ancienne note",
    });
    expect(noteButton.tagName).toBe("BUTTON");
    expect(screen.getByText("Contenu conservé")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Couleur jaune" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("searches titles and note bodies from the macOS-style search field", () => {
    seedNotes([
      createNote({ id: "a", title: "Voyage", body: "Billets de train", updatedAt: 10 }),
      createNote({ id: "b", title: "Courses", body: "Pommes et café", updatedAt: 20 }),
    ]);
    render(<NotesWindow />);
    const search = screen.getByRole("searchbox", {
      name: "Rechercher dans les notes",
    });

    fireEvent.change(search, { target: { value: "café" } });
    expect(
      screen.getByRole("button", { name: "Ouvrir la note Courses" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ouvrir la note Voyage" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Effacer la recherche" })
    );
    expect(search).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Ouvrir la note Voyage" })
    ).toBeInTheDocument();
  });

  test("groups pinned notes first and sorts each group by last modification", () => {
    seedNotes([
      createNote({ id: "old", title: "Ancienne", updatedAt: 100 }),
      createNote({ id: "pin", title: "Épinglée", updatedAt: 50, pinned: true }),
      createNote({ id: "new", title: "Récente", updatedAt: 200 }),
    ]);
    render(<NotesWindow />);

    const noteButtons = screen.getAllByRole("button", { name: /^Ouvrir la note/ });
    expect(noteButtons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Ouvrir la note Épinglée",
      "Ouvrir la note Récente",
      "Ouvrir la note Ancienne",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Épingler Ancienne" }));
    expect(
      screen.getByRole("button", { name: "Désépingler Ancienne" })
    ).toHaveAttribute("aria-pressed", "true");
    const reorderedButtons = screen.getAllByRole("button", {
      name: /^Ouvrir la note/,
    });
    expect(reorderedButtons[0]).toHaveAttribute(
      "aria-label",
      "Ouvrir la note Ancienne"
    );
  });

  test("moves an edited note to the top of its modification group", () => {
    seedNotes([
      createNote({ id: "old", title: "Ancienne", updatedAt: 100 }),
      createNote({ id: "new", title: "Récente", updatedAt: 200 }),
    ]);
    render(<NotesWindow />);
    fireEvent.click(
      screen.getByRole("button", { name: "Ouvrir la note Ancienne" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Contenu de la note" }), {
      target: { value: "Ancienne modifiée\nNouveau contenu" },
    });

    const noteButtons = screen.getAllByRole("button", { name: /^Ouvrir la note/ });
    expect(noteButtons[0]).toHaveAttribute(
      "aria-label",
      "Ouvrir la note Ancienne modifiée"
    );
  });

  test("offers an undo action before finalizing a deletion", () => {
    seedNotes([
      createNote({ id: "a", title: "À supprimer", updatedAt: 200 }),
      createNote({ id: "b", title: "À garder", updatedAt: 100 }),
    ]);
    render(<NotesWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Supprimer la note" }));

    expect(
      screen.queryByRole("button", { name: "Ouvrir la note À supprimer" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "« À supprimer » supprimée"
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Annuler la suppression" })
    );
    expect(
      screen.getByRole("button", { name: "Ouvrir la note À supprimer" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("debounces storage writes and shows save and word-count status", () => {
    seedNotes([
      createNote({ id: "a", title: "Un deux trois", body: "", updatedAt: 100 }),
    ]);
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<NotesWindow />);
    expect(screen.getByText("3 mots")).toBeInTheDocument();
    expect(screen.getByText("Enregistré")).toBeInTheDocument();

    const editor = screen.getByRole("textbox", { name: "Contenu de la note" });
    fireEvent.change(editor, { target: { value: "Un deux trois quatre" } });
    fireEvent.change(editor, { target: { value: "Un deux trois quatre cinq" } });
    expect(screen.getByText("5 mots")).toBeInTheDocument();
    expect(screen.getByText("Enregistrement…")).toBeInTheDocument();
    expect(setItem).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(NOTES_SAVE_DELAY - 1));
    expect(setItem).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItem.mock.calls[0][1])[0].content).toBe(
      "Un deux trois quatre cinq"
    );
    expect(screen.getByText("Enregistré")).toBeInTheDocument();
  });

  test("flushes the latest pending note when the window unmounts", () => {
    seedNotes([createNote({ id: "a", title: "Brouillon", updatedAt: 100 })]);
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { unmount } = render(<NotesWindow />);
    fireEvent.change(screen.getByRole("textbox", { name: "Contenu de la note" }), {
      target: { value: "Texte final avant fermeture" },
    });
    expect(setItem).not.toHaveBeenCalled();

    unmount();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItem.mock.calls[0][1])[0].content).toBe(
      "Texte final avant fermeture"
    );
  });

  test("persists color changes and exposes note date and excerpt metadata", () => {
    seedNotes([
      createNote({
        id: "a",
        title: "Design",
        body: "Choisir une couleur",
        updatedAt: Date.now(),
        color: "yellow",
      }),
    ]);
    const { container } = render(<NotesWindow />);
    expect(screen.getByText("Choisir une couleur")).toBeInTheDocument();
    expect(container.querySelectorAll("time").length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole("button", { name: "Couleur bleue" }));
    expect(
      screen.getByRole("button", { name: "Couleur bleue" })
    ).toHaveAttribute("aria-pressed", "true");
    act(() => vi.advanceTimersByTime(NOTES_SAVE_DELAY));
    expect(JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY))[0].color).toBe(
      "blue"
    );
  });

  test("focuses search only when Notes is the visible foreground app", () => {
    seedNotes([createNote({ id: "a", title: "Note", updatedAt: 100 })]);
    const { rerender } = render(<NotesWindow isActive isVisible />);
    const search = screen.getByRole("searchbox", {
      name: "Rechercher dans les notes",
    });

    fireEvent.keyDown(document, { key: "f", metaKey: true });
    expect(search).toHaveFocus();
    rerender(<NotesWindow isActive={false} isVisible />);
    search.blur();
    fireEvent.keyDown(document, { key: "f", ctrlKey: true });
    expect(search).not.toHaveFocus();
  });
});
