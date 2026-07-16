import { useEffect, useMemo, useRef, useState } from "react";
import "./notes_window.scss";

export const NOTES_STORAGE_KEY = "portfolio-notes";
export const NOTES_SAVE_DELAY = 600;

const NOTE_COLORS = ["yellow", "orange", "pink", "purple", "blue", "green"];
const NOTE_COLOR_LABELS = {
  yellow: "jaune",
  orange: "orange",
  pink: "rose",
  purple: "violette",
  blue: "bleue",
  green: "verte",
};
let fallbackId = 0;

const createNoteId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  fallbackId += 1;
  return `note-${Date.now()}-${fallbackId}`;
};

const createDefaultNotes = () => [
  {
    id: createNoteId(),
    content:
      "Bienvenue dans Notes ! 📝\n\nCette application fonctionne comme la vraie : tout ce que vous écrivez ici est sauvegardé dans votre navigateur (localStorage).\n\nFermez la fenêtre, rechargez la page, revenez dans une semaine... vos notes seront toujours là.\n\nN'hésitez pas à laisser vos impressions sur ce portfolio 😊",
    updatedAt: Date.now(),
    pinned: true,
    color: "yellow",
  },
];

const normalizeNote = (note, index) => {
  if (
    !note ||
    !["string", "number"].includes(typeof note.id) ||
    typeof note.content !== "string"
  ) {
    return null;
  }

  return {
    id: note.id,
    content: note.content,
    updatedAt: Number.isFinite(note.updatedAt) ? note.updatedAt : Date.now(),
    pinned: Boolean(note.pinned),
    color: NOTE_COLORS.includes(note.color)
      ? note.color
      : NOTE_COLORS[index % NOTE_COLORS.length],
  };
};

export const loadNotes = () => {
  try {
    const serializedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (serializedNotes === null) return createDefaultNotes();
    const savedNotes = JSON.parse(serializedNotes);
    if (!Array.isArray(savedNotes)) return createDefaultNotes();
    return savedNotes
      .map(normalizeNote)
      .filter(Boolean);
  } catch (error) {
    return createDefaultNotes();
  }
};

const saveNotes = (notes) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    return false;
  }
};

export const noteTitle = (content) => {
  const firstLine = content.split("\n").find((line) => line.trim() !== "");
  return firstLine ? firstLine.trim() : "Nouvelle note";
};

export const notePreview = (content) => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 1
    ? lines.slice(1).join(" ")
    : "Aucun texte supplémentaire";
};

const formatEditorDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatListDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() === today.getFullYear() ? undefined : "2-digit",
  });
};

export const countWords = (content) => {
  const trimmedContent = content.trim();
  return trimmedContent ? trimmedContent.split(/\s+/u).length : 0;
};

const sortNotes = (notes) =>
  [...notes].sort((firstNote, secondNote) => {
    if (firstNote.pinned !== secondNote.pinned) {
      return firstNote.pinned ? -1 : 1;
    }
    return secondNote.updatedAt - firstNote.updatedAt;
  });

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  );
}

function ComposeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M9 6V4h6v2M19 6l-1 15H6L5 6" />
    </svg>
  );
}

function PinIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        className={filled ? "filled" : ""}
        d="m14.5 3 6.5 6.5-3 1.2-3.8 3.8.3 3-1.4 1.4-4-4-4.8 4.8-1-1 4.8-4.8-4-4 1.4-1.4 3 .3 3.8-3.8L14.5 3Z"
      />
    </svg>
  );
}

export default function NotesWindow({
  isActive = true,
  isVisible = true,
}) {
  const [notes, setNotes] = useState(loadNotes);
  const [selectedId, setSelectedId] = useState(() => notes[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [deletedNote, setDeletedNote] = useState(null);
  const initialRenderRef = useRef(true);
  const latestNotesRef = useRef(notes);
  const saveTimerRef = useRef(null);
  const savePendingRef = useRef(false);
  const undoTimerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    latestNotesRef.current = notes;
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    savePendingRef.current = true;
    setSaveStatus("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const didSave = saveNotes(latestNotesRef.current);
      savePendingRef.current = false;
      saveTimerRef.current = null;
      setSaveStatus(didSave ? "saved" : "error");
    }, NOTES_SAVE_DELAY);
  }, [notes]);

  useEffect(
    () => () => {
      clearTimeout(saveTimerRef.current);
      clearTimeout(undoTimerRef.current);
      if (savePendingRef.current) saveNotes(latestNotesRef.current);
    },
    []
  );

  useEffect(() => {
    if (!isActive || !isVisible) return undefined;
    const focusSearch = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "f") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, [isActive, isVisible]);

  const selectedNote = notes.find((note) => note.id === selectedId) || null;
  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR");
    const matchingNotes = normalizedQuery
      ? notes.filter((note) =>
          note.content
            .toLocaleLowerCase("fr-FR")
            .includes(normalizedQuery)
        )
      : notes;
    return sortNotes(matchingNotes);
  }, [notes, query]);

  const groupedNotes = useMemo(
    () => [
      {
        label: "Épinglées",
        notes: visibleNotes.filter((note) => note.pinned),
      },
      {
        label: "Notes",
        notes: visibleNotes.filter((note) => !note.pinned),
      },
    ].filter((group) => group.notes.length > 0),
    [visibleNotes]
  );

  const updateNote = (noteId, update) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              ...(typeof update === "function" ? update(note) : update),
            }
          : note
      )
    );
  };

  const handleNewNote = () => {
    const newNote = {
      id: createNoteId(),
      content: "",
      updatedAt: Date.now(),
      pinned: false,
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
    };
    setNotes((currentNotes) => [newNote, ...currentNotes]);
    setSelectedId(newNote.id);
    setQuery("");
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    clearTimeout(undoTimerRef.current);
    const noteToDelete = selectedNote;
    const remainingNotes = notes.filter((note) => note.id !== selectedId);
    setDeletedNote(noteToDelete);
    setNotes(remainingNotes);
    setSelectedId(sortNotes(remainingNotes)[0]?.id ?? null);
    undoTimerRef.current = setTimeout(() => {
      setDeletedNote(null);
      undoTimerRef.current = null;
    }, 5000);
  };

  const undoDelete = () => {
    if (!deletedNote) return;
    clearTimeout(undoTimerRef.current);
    setNotes((currentNotes) =>
      currentNotes.some((note) => note.id === deletedNote.id)
        ? currentNotes
        : [...currentNotes, deletedNote]
    );
    setSelectedId(deletedNote.id);
    setDeletedNote(null);
    undoTimerRef.current = null;
  };

  const handleChange = (event) => {
    const content = event.target.value;
    updateNote(selectedId, {
      content,
      updatedAt: Date.now(),
    });
  };

  const wordCount = selectedNote ? countWords(selectedNote.content) : 0;
  const saveLabel = {
    saved: "Enregistré",
    saving: "Enregistrement…",
    error: "Non enregistré",
  }[saveStatus];

  return (
    <section className="notes-app">
      <aside className="notes-sidebar">
        <div className="notes-actions">
          <strong>Notes</strong>
          <div>
            <button
              type="button"
              aria-label="Nouvelle note"
              onClick={handleNewNote}
            >
              <ComposeIcon />
            </button>
            <button
              type="button"
              aria-label="Supprimer la note"
              onClick={handleDeleteNote}
              disabled={!selectedNote}
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <label className="notes-search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher"
            aria-label="Rechercher dans les notes"
          />
          {query && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
          <kbd>⌘F</kbd>
        </label>

        <div className="notes-list" aria-label="Liste des notes">
          {groupedNotes.length > 0 ? (
            groupedNotes.map((group) => (
              <section className="notes-group" key={group.label}>
                <h3>{group.label}</h3>
                {group.notes.map((note) => {
                  const title = noteTitle(note.content);
                  return (
                    <div
                      className={`note-item${
                        note.id === selectedId ? " selected" : ""
                      }`}
                      key={note.id}
                    >
                      <button
                        type="button"
                        className="note-select"
                        aria-label={`Ouvrir la note ${title}`}
                        aria-current={note.id === selectedId ? "true" : undefined}
                        onClick={() => setSelectedId(note.id)}
                      >
                        <span className={`note-color ${note.color}`} />
                        <span className="note-summary">
                          <strong>{title}</strong>
                          <span className="note-metadata">
                            <time dateTime={new Date(note.updatedAt).toISOString()}>
                              {formatListDate(note.updatedAt)}
                            </time>
                            <span>{notePreview(note.content)}</span>
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`note-pin${note.pinned ? " pinned" : ""}`}
                        aria-label={`${note.pinned ? "Désépingler" : "Épingler"} ${title}`}
                        aria-pressed={note.pinned}
                        onClick={() =>
                          updateNote(note.id, (currentNote) => ({
                            pinned: !currentNote.pinned,
                          }))
                        }
                      >
                        <PinIcon filled={note.pinned} />
                      </button>
                    </div>
                  );
                })}
              </section>
            ))
          ) : (
            <div className="notes-no-results">
              <SearchIcon />
              <p>Aucune note trouvée</p>
              <span>Essaie une autre recherche.</span>
            </div>
          )}
        </div>
      </aside>

      {selectedNote ? (
        <div className="notes-editor">
          <header className="editor-toolbar">
            <div className="note-colors" aria-label="Couleur de la note">
              {NOTE_COLORS.map((color) => (
                <button
                  type="button"
                  className={`${color}${selectedNote.color === color ? " selected" : ""}`}
                  aria-label={`Couleur ${NOTE_COLOR_LABELS[color]}`}
                  aria-pressed={selectedNote.color === color}
                  key={color}
                  onClick={() =>
                    updateNote(selectedNote.id, {
                      color,
                      updatedAt: Date.now(),
                    })
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className={`editor-pin${selectedNote.pinned ? " pinned" : ""}`}
              aria-label={
                selectedNote.pinned ? "Désépingler la note" : "Épingler la note"
              }
              aria-pressed={selectedNote.pinned}
              onClick={() =>
                updateNote(selectedNote.id, {
                  pinned: !selectedNote.pinned,
                })
              }
            >
              <PinIcon filled={selectedNote.pinned} />
            </button>
          </header>

          <div className="editor-status">
            <time dateTime={new Date(selectedNote.updatedAt).toISOString()}>
              {formatEditorDate(selectedNote.updatedAt)}
            </time>
            <span className={`save-status ${saveStatus}`}>
              <i /> {saveLabel}
            </span>
            <span>{wordCount} mot{wordCount > 1 ? "s" : ""}</span>
          </div>

          <textarea
            value={selectedNote.content}
            onChange={handleChange}
            placeholder="Écrivez quelque chose..."
            aria-label="Contenu de la note"
            spellCheck="false"
          />
        </div>
      ) : (
        <div className="notes-empty">
          <ComposeIcon />
          <p>Aucune note sélectionnée</p>
          <button type="button" onClick={handleNewNote}>
            Créer une note
          </button>
        </div>
      )}

      {deletedNote && (
        <div className="notes-undo" role="status">
          <span>« {noteTitle(deletedNote.content)} » supprimée</span>
          <button type="button" onClick={undoDelete}>
            Annuler la suppression
          </button>
        </div>
      )}
    </section>
  );
}
