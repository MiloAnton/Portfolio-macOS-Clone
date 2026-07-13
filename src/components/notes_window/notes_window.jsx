import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./notes_window.scss";
import { useEffect, useState } from "react";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";

const STORAGE_KEY = "portfolio-notes";

const defaultNotes = [
  {
    id: 1,
    content:
      "Bienvenue dans Notes ! 📝\n\nCette application fonctionne comme la vraie : tout ce que vous écrivez ici est sauvegardé dans votre navigateur (localStorage).\n\nFermez la fenêtre, rechargez la page, revenez dans une semaine... vos notes seront toujours là.\n\nN'hésitez pas à laisser vos impressions sur ce portfolio 😊",
    updatedAt: Date.now(),
  },
];

const loadNotes = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (e) {
    // localStorage corrompu ou indisponible : on repart des notes par défaut
  }
  return defaultNotes;
};

const noteTitle = (content) => {
  const firstLine = content.split("\n").find((line) => line.trim() !== "");
  return firstLine ? firstLine.trim() : "Nouvelle note";
};

const notePreview = (content) => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  return lines.length > 1 ? lines[1].trim() : "Aucun texte supplémentaire";
};

const noteDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotesWindow(props) {
  const [defaultWidth, defaultHeight] = props.defaultSize || [750, 500];
  const { position, handleDragStop } = usePersistentWindowPosition(
    "notes",
    defaultWidth,
    defaultHeight
  );
  const [notes, setNotes] = useState(loadNotes);
  const [selectedId, setSelectedId] = useState(() => loadNotes()[0]?.id);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      // stockage plein ou bloqué : la session reste utilisable sans persistance
    }
  }, [notes]);

  const selectedNote = notes.find((note) => note.id === selectedId);

  const handleNewNote = () => {
    const newNote = { id: Date.now(), content: "", updatedAt: Date.now() };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
  };

  const handleDeleteNote = () => {
    const remaining = notes.filter((note) => note.id !== selectedId);
    setNotes(remaining);
    setSelectedId(remaining[0]?.id);
  };

  const handleChange = (event) => {
    setNotes(
      notes.map((note) =>
        note.id === selectedId
          ? { ...note, content: event.target.value, updatedAt: Date.now() }
          : note
      )
    );
  };

  const handleFullscreen = () => {
    props.fullScreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={
          props.isMinimized
            ? { display: "none" }
            : { zIndex: props.zIndex }
        }
        onMouseDownCapture={() => props.handleClickZIndex()}
        width={defaultWidth} // Largeur initiale de la fenêtre
        height={defaultHeight} // Hauteur initiale de la fenêtre
        minConstraints={[500, 300]} // Largeur et hauteur minimales
        maxConstraints={[2560, 1440]} // Largeur et hauteur maximales
        resizeHandles={["se"]} // Redimensionner uniquement depuis le coin inférieur droit
      >
        <MenuBar
          handleFullscreen={handleFullscreen}
          handleQuit={handleQuit}
          handleMinimize={props.handleMinimize}
        />
        <section className="notes-app">
          <div className="notes-sidebar">
            <div className="notes-actions">
              <button title="Nouvelle note" onClick={handleNewNote}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                title="Supprimer la note"
                onClick={handleDeleteNote}
                disabled={!selectedNote}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <div className="notes-list">
              {notes.map((note) => (
                <div
                  className={
                    note.id === selectedId ? "note-item selected" : "note-item"
                  }
                  key={note.id}
                  onClick={() => setSelectedId(note.id)}
                >
                  <h4>{noteTitle(note.content)}</h4>
                  <p>{notePreview(note.content)}</p>
                </div>
              ))}
            </div>
          </div>
          {selectedNote ? (
            <div className="notes-editor">
              <p className="note-date">{noteDate(selectedNote.updatedAt)}</p>
              <textarea
                value={selectedNote.content}
                onChange={handleChange}
                placeholder="Écrivez quelque chose..."
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="notes-empty">
              <p>Aucune note sélectionnée</p>
            </div>
          )}
        </section>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
