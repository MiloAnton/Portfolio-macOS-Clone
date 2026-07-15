import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import profilePicture from "../../assets/profil.jpg";
import "./messages_window.scss";

export const MESSAGES_STORAGE_KEY = "portfolio-messages-v1";

const SUGGESTIONS = [
  { label: "Tes projets", message: "Peux-tu me parler de tes projets ?" },
  { label: "Ta stack", message: "Quelle est ta stack technique ?" },
  { label: "Te contacter", message: "Comment est-ce que je peux te contacter ?" },
];

let fallbackId = 0;

export const createMessageId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  fallbackId += 1;
  return `message-${fallbackId}-${Math.random().toString(36).slice(2, 10)}`;
};

export const formatMessageTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const createWelcomeMessages = (now = Date.now()) => [
  {
    id: createMessageId(),
    from: "milo",
    text: "Salut 👋 Bienvenue dans Messages !",
    sentAt: now - 60_000,
  },
  {
    id: createMessageId(),
    from: "milo",
    text: "C’est une petite simulation bricolée localement... pas une IA, pas de serveur. Tu peux quand même me parler de projets, de ma stack ou de mon parcours.",
    sentAt: now - 45_000,
  },
];

const loadMessages = () => {
  try {
    const storedMessages = JSON.parse(
      localStorage.getItem(MESSAGES_STORAGE_KEY)
    );
    if (!Array.isArray(storedMessages) || storedMessages.length === 0) {
      return createWelcomeMessages();
    }

    const validMessages = storedMessages
      .filter(
        (message) =>
          message &&
          (message.from === "milo" || message.from === "visitor") &&
          typeof message.text === "string"
      )
      .map((message) => ({
        id: typeof message.id === "string" ? message.id : createMessageId(),
        from: message.from,
        text: message.text.slice(0, 300),
        sentAt: Number.isFinite(message.sentAt) ? message.sentAt : Date.now(),
        status:
          message.from === "visitor" && message.status === "delivered"
            ? "delivered"
            : message.from === "visitor"
              ? "read"
              : undefined,
      }));
    return validMessages.length > 0
      ? validMessages
      : createWelcomeMessages();
  } catch (error) {
    return createWelcomeMessages();
  }
};

const saveMessages = (messages) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    // La discussion reste disponible pendant la session si le stockage échoue.
  }
};

export const getReply = (message) => {
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

export default function MessagesWindow() {
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [arrivingIds, setArrivingIds] = useState(() => new Set());
  const bottomRef = useRef(null);
  const replyTimerRef = useRef(null);
  const replyGenerationRef = useRef(0);

  const cancelPendingReply = useCallback(() => {
    replyGenerationRef.current += 1;
    if (replyTimerRef.current !== null) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => cancelPendingReply, [cancelPendingReply]);

  const latestMessage = messages[messages.length - 1];
  const latestPreview = latestMessage?.text || "Conversation locale";
  const latestTime = latestMessage
    ? formatMessageTime(latestMessage.sentAt)
    : "";

  const markAsArriving = (id) => {
    setArrivingIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(id);
      return nextIds;
    });
  };

  const queueMessage = useCallback(
    (rawText) => {
      const text = rawText.trim();
      if (!text || isTyping) return;

      cancelPendingReply();
      const visitorMessage = {
        id: createMessageId(),
        from: "visitor",
        text,
        sentAt: Date.now(),
        status: "delivered",
      };
      const currentGeneration = replyGenerationRef.current;
      setMessages((currentMessages) => [
        ...currentMessages,
        visitorMessage,
      ]);
      markAsArriving(visitorMessage.id);
      setInput("");
      setIsTyping(true);

      replyTimerRef.current = setTimeout(() => {
        if (currentGeneration !== replyGenerationRef.current) return;
        const replyMessage = {
          id: createMessageId(),
          from: "milo",
          text: getReply(text),
          sentAt: Date.now(),
        };
        setMessages((currentMessages) => [
          ...currentMessages.map((message) =>
            message.id === visitorMessage.id
              ? { ...message, status: "read" }
              : message
          ),
          replyMessage,
        ]);
        markAsArriving(replyMessage.id);
        setIsTyping(false);
        replyTimerRef.current = null;
      }, 750);
    },
    [cancelPendingReply, isTyping]
  );

  const sendMessage = (event) => {
    event.preventDefault();
    queueMessage(input);
  };

  const clearConversation = () => {
    cancelPendingReply();
    setIsTyping(false);
    setInput("");
    setArrivingIds(new Set());
    setMessages(createWelcomeMessages());
  };

  const suggestionButtons = useMemo(
    () =>
      SUGGESTIONS.map((suggestion) => (
        <button
          type="button"
          disabled={isTyping}
          onClick={() => queueMessage(suggestion.message)}
          key={suggestion.label}
        >
          {suggestion.label}
        </button>
      )),
    [isTyping, queueMessage]
  );

  return (
    <div className={`messages-app${sidebarOpen ? " sidebar-open" : ""}`}>
      <button
        type="button"
        className="messages-sidebar-backdrop"
        aria-label="Fermer la liste des conversations"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className="messages-sidebar">
        <div className="sidebar-heading">
          <h2>Messages</h2>
        </div>
        <button
          type="button"
          className="conversation selected"
          onClick={() => setSidebarOpen(false)}
        >
          <img src={profilePicture} alt="Milo" />
          <span>
            <span className="conversation-line">
              <strong>Milo</strong>
              <time>{latestTime}</time>
            </span>
            <span className="conversation-preview">{latestPreview}</span>
          </span>
        </button>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <button
            type="button"
            className="sidebar-toggle"
            aria-label="Afficher les conversations"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((currentState) => !currentState)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="chat-contact">
            <img src={profilePicture} alt="" />
            <strong>Milo</strong>
            <span>Simulation locale</span>
          </div>
          <button
            type="button"
            className="clear-conversation"
            onClick={clearConversation}
            aria-label="Effacer la conversation"
            title="Effacer la conversation"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m2 0-1 14H7L6 6m4 4v6m4-6v6" />
            </svg>
          </button>
        </header>

        <div className="message-list" aria-live="polite">
          <p className="conversation-date">Aujourd’hui</p>
          {messages.map((message) => (
            <div
              className={`message-row ${message.from}${
                arrivingIds.has(message.id) ? " arriving" : ""
              }`}
              key={message.id}
            >
              {message.from === "milo" && (
                <img src={profilePicture} alt="" />
              )}
              <div className="message-content">
                <p className="message-bubble">{message.text}</p>
                <div className="message-meta">
                  <time dateTime={new Date(message.sentAt).toISOString()}>
                    {formatMessageTime(message.sentAt)}
                  </time>
                  {message.from === "visitor" && (
                    <span>
                      {message.status === "read" ? "Lu" : "Distribué"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-row milo typing" aria-label="Milo écrit">
              <img src={profilePicture} alt="" />
              <p className="message-bubble"><span /><span /><span /></p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {showSuggestions && (
          <div className="message-suggestions" aria-label="Suggestions">
            {suggestionButtons}
          </div>
        )}

        <form className="message-composer" onSubmit={sendMessage}>
          <button
            type="button"
            className="add-button"
            aria-label={showSuggestions ? "Masquer les suggestions" : "Afficher les suggestions"}
            aria-expanded={showSuggestions}
            onClick={() => setShowSuggestions((currentState) => !currentState)}
          >
            +
          </button>
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
  );
}
