import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MenuBar from "../menu_bar/menu_bar";
import profilePicture from "../../assets/profil.jpg";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import "./messages_window.scss";

const initialMessages = [
  {
    id: 1,
    from: "milo",
    text: "Salut 👋 Bienvenue dans Messages !",
  },
  {
    id: 2,
    from: "milo",
    text: "C’est une petite simulation bricolée localement... pas une IA, pas de serveur. Tu peux quand même me parler de projets, de ma stack ou de mon parcours.",
  },
];

const getReply = (message) => {
  const text = message.toLocaleLowerCase("fr-FR");

  if (/bonjour|salut|hello|coucou/.test(text)) {
    return "Salut ! Ravi de te voir ici 😊";
  }
  if (/projet|portfolio|travail/.test(text)) {
    return "Tu peux ouvrir l’app Projets depuis le Dock ou le dossier présent sur le bureau. C’est là que j’ai regroupé une sélection de mes réalisations.";
  }
  if (/stack|technologie|techno|langage|dévelop/.test(text)) {
    return "Ma stack est assez large : React, Next.js, Django, NestJS, Docker, Kubernetes… La section « Stack maîtrisée » détaille tout ça.";
  }
  if (/cv|parcours|expérience|formation/.test(text)) {
    return "Mon CV est téléchargeable directement depuis l’icône CV.pdf sur le bureau. Mon parcours complet est aussi visible dans la fenêtre principale.";
  }
  if (/contact|mail|email|recrut|mission|disponible/.test(text)) {
    return "Pour un vrai échange, le mieux est de me contacter via LinkedIn. Le Terminal contient la commande `open linkedin` 😉";
  }
  if (/merci|super|bravo|cool/.test(text)) {
    return "Merci beaucoup ! J’espère que cette petite expérience macOS te plaît 🙌";
  }
  if (/qui es|tu fais quoi|présente/.test(text)) {
    return "Je suis Milo, entrepreneur et formateur, avec un fort tropisme produit et développement web.";
  }

  return "Là, mon faux bot atteint déjà ses limites 😅 Essaie de me parler de mes projets, de ma stack, de mon CV ou de contact.";
};

export default function MessagesWindow(props) {
  const [defaultWidth, defaultHeight] = props.defaultSize || [760, 560];
  const { position, handleDragStop } = usePersistentWindowPosition(
    "messages",
    defaultWidth,
    defaultHeight
  );
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const replyTimerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => clearTimeout(replyTimerRef.current);
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), from: "visitor", text },
    ]);
    setInput("");
    setIsTyping(true);

    replyTimerRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, from: "milo", text: getReply(text) },
      ]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App messages-window ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={props.handleClickZIndex}
        width={defaultWidth}
        height={defaultHeight}
        minConstraints={[520, 380]}
        maxConstraints={[2560, 1440]}
        resizeHandles={["se"]}
      >
        <MenuBar
          title="Messages"
          handleFullscreen={props.fullScreen}
          handleQuit={props.handleClose}
          handleMinimize={props.handleMinimize}
        />

        <div className="messages-app">
          <aside className="messages-sidebar">
            <div className="sidebar-heading">
              <h2>Messages</h2>
              <button type="button" title="Nouvelle conversation">⌑</button>
            </div>
            <div className="conversation selected">
              <img src={profilePicture} alt="Milo" />
              <div>
                <div className="conversation-line">
                  <strong>Milo</strong>
                  <time>maintenant</time>
                </div>
                <p>Petite simulation locale…</p>
              </div>
            </div>
          </aside>

          <section className="chat-panel">
            <header className="chat-header">
              <img src={profilePicture} alt="" />
              <strong>Milo</strong>
              <span>Simulation locale</span>
            </header>

            <div className="message-list" aria-live="polite">
              <p className="conversation-date">Aujourd’hui</p>
              {messages.map((message) => (
                <div className={`message-row ${message.from}`} key={message.id}>
                  {message.from === "milo" && (
                    <img src={profilePicture} alt="" />
                  )}
                  <p>{message.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="message-row milo typing" aria-label="Milo écrit">
                  <img src={profilePicture} alt="" />
                  <p><span /><span /><span /></p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className="message-composer" onSubmit={sendMessage}>
              <button type="button" className="add-button" title="Fonctionnalité décorative">+</button>
              <div>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="iMessage"
                  aria-label="Votre message"
                  maxLength={300}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!input.trim() || isTyping}
                  aria-label="Envoyer"
                >
                  ↑
                </button>
              </div>
            </form>
          </section>
        </div>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
