import { useEffect, useRef, useState } from "react";
import "./terminal_window.scss";
import listStack from "./../../ressources/listStack.json";
import projectsList from "./../../ressources/listProjects.json";
import experienceList from "./../../ressources/listExperiences.json";
import version from "./../../../package.json";

export const TERMINAL_HISTORY_KEY = "portfolio-terminal-history";
export const TERMINAL_THEME_KEY = "portfolio-terminal-theme";
export const MAX_HISTORY_ENTRIES = 100;
export const MAX_TERMINAL_LINES = 400;

const THEMES = [
  { id: "pro", label: "Pro" },
  { id: "homebrew", label: "Homebrew" },
  { id: "ocean", label: "Ocean" },
  { id: "light", label: "Clair" },
];

export const COMMANDS = [
  "help",
  "about",
  "ls",
  "cd",
  "cat",
  "projets",
  "open",
  "history",
  "man",
  "neofetch",
  "whoami",
  "echo",
  "date",
  "pwd",
  "clear",
  "exit",
  "sudo",
];

const LINKS = {
  github: "https://github.com/MiloAnton",
  linkedin: "https://www.linkedin.com/in/milo-roche-vandenbroucque/",
  leonis: "https://leonis-formation.fr",
};

const OPEN_TARGETS = [...Object.keys(LINKS), "projets", "cv"];
const DIRECTORY_TARGETS = ["projets", "..", "~"];

const FILES = {
  "cv.txt": experienceList.experiences.map(
    (experience) =>
      `${experience.timeline.padEnd(14)} ${experience.poste} @ ${experience.entreprise}`
  ),
  "stack.txt": Object.entries(listStack).map(
    ([category, items]) =>
      `${category.padEnd(10)} ${items.map((item) => item.nom).join(", ")}`
  ),
  "contact.txt": [
    "GitHub    : github.com/MiloAnton",
    "LinkedIn  : linkedin.com/in/milo-roche-vandenbroucque",
    "Leonis    : leonis-formation.fr",
    "",
    "Astuce : `open github`, `open linkedin` ou `open leonis` pour y aller directement.",
  ],
};

const MANUAL = {
  help: ["help — affiche la liste résumée des commandes disponibles."],
  about: ["about — présente Milo, son parcours et son activité."],
  ls: ["ls [chemin] — liste les fichiers du dossier courant ou de projets/."],
  cd: ["cd [projets|..|~] — change le dossier courant du terminal émulé."],
  cat: ["cat <fichier> — affiche contact.txt, cv.txt ou stack.txt."],
  projets: ["projets — affiche les projets, leurs dates et leurs technologies."],
  open: [
    "open <cible> — ouvre github, linkedin, leonis, projets ou cv.",
    "`open projets` ouvre l’application Projets ; `open cv` télécharge le PDF.",
  ],
  history: ["history — affiche les 100 dernières commandes conservées localement."],
  man: ["man <commande> — affiche le manuel concis d’une commande."],
  neofetch: ["neofetch — affiche les informations du système portfolio."],
  whoami: ["whoami — affiche l’utilisateur de la session."],
  echo: ["echo <texte> — réaffiche le texte fourni."],
  date: ["date — affiche la date et l’heure locales."],
  pwd: ["pwd — affiche le chemin absolu du dossier courant."],
  clear: ["clear — efface la sortie visible du Terminal."],
  exit: ["exit — ferme la fenêtre Terminal."],
  sudo: ["sudo — rappelle poliment que visiteur n’est pas administrateur."],
};

const RECOGNIZED_FILES = ["contact.txt", "cv.txt", "stack.txt", "CV.pdf", "projets/"];
const INTERACTIVE_TOKEN_PATTERN =
  /(https?:\/\/[^\s`),;…]+|(?:github\.com|linkedin\.com|leonis-formation\.fr)[^\s`),;…]*|contact\.txt|cv\.txt|stack\.txt|CV\.pdf|projets\/)/g;

let lineId = 0;

const createLine = (text, options = {}) => {
  lineId += 1;
  return { id: `terminal-line-${lineId}`, prompt: false, text, ...options };
};

const createWelcomeLines = () => [
  createLine(`Last login: ${new Date().toLocaleString("fr-FR")} on ttys001`),
  createLine("Bienvenue dans le terminal de mon portfolio ! Tapez `help` pour commencer."),
];

export const capTerminalLines = (lines) => lines.slice(-MAX_TERMINAL_LINES);

export const loadCommandHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(TERMINAL_HISTORY_KEY));
    return Array.isArray(history)
      ? history.filter((entry) => typeof entry === "string").slice(0, MAX_HISTORY_ENTRIES)
      : [];
  } catch (error) {
    return [];
  }
};

const saveCommandHistory = (history) => {
  try {
    localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    // Le Terminal reste fonctionnel si le stockage local est indisponible.
  }
};

const loadTheme = () => {
  try {
    const storedTheme = localStorage.getItem(TERMINAL_THEME_KEY);
    return THEMES.some((theme) => theme.id === storedTheme) ? storedTheme : "pro";
  } catch (error) {
    return "pro";
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem(TERMINAL_THEME_KEY, theme);
  } catch (error) {
    // Le thème reste actif pour la session courante.
  }
};

const longestCommonPrefix = (values) => {
  if (!values.length) return "";
  return values.reduce((prefix, value) => {
    let index = 0;
    while (index < prefix.length && prefix[index] === value[index]) index += 1;
    return prefix.slice(0, index);
  });
};

export const getCompletionContext = (rawInput) => {
  const leadingWhitespace = rawInput.match(/^\s*/)?.[0] || "";
  const content = rawInput.slice(leadingWhitespace.length);
  const endsWithSpace = /\s$/.test(content);
  const tokens = content.trim().split(/\s+/).filter(Boolean);
  const command = tokens[0] || "";
  const partial = endsWithSpace ? "" : tokens[tokens.length - 1] || "";
  let available = COMMANDS;

  if (tokens.length > 1 || endsWithSpace) {
    if (command === "cat") available = Object.keys(FILES);
    else if (command === "open") available = OPEN_TARGETS;
    else if (command === "cd") available = DIRECTORY_TARGETS;
    else if (command === "man") available = COMMANDS;
    else available = [];
  }

  const normalizedPartial = partial.toLocaleLowerCase("fr-FR");
  const candidates = available.filter((candidate) =>
    candidate.toLocaleLowerCase("fr-FR").startsWith(normalizedPartial)
  );
  return {
    candidates,
    partial,
    replacementStart: rawInput.length - partial.length,
  };
};

const normalizeUrl = (value) =>
  value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

function InteractiveText({ text, onFile }) {
  const parts = text.split(INTERACTIVE_TOKEN_PATTERN);
  return parts.map((part, index) => {
    if (!part) return null;
    if (RECOGNIZED_FILES.includes(part)) {
      return (
        <button
          type="button"
          className="terminal-file"
          onClick={(event) => {
            event.stopPropagation();
            onFile(part);
          }}
          key={`${part}-${index}`}
        >
          {part}
        </button>
      );
    }
    if (/^(https?:\/\/|github\.com|linkedin\.com|leonis-formation\.fr)/.test(part)) {
      return (
        <a
          href={normalizeUrl(part)}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          key={`${part}-${index}`}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function TerminalWindow({ closeWindow, openWindow }) {
  const [lines, setLines] = useState(createWelcomeLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(loadCommandHistory);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const [theme, setTheme] = useState(loadTheme);
  const [completionSuggestions, setCompletionSuggestions] = useState([]);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const mountTimeRef = useRef(Date.now());
  const busyRef = useRef(false);
  const timersRef = useRef(new Set());

  const prompt = `visiteur@milo ${cwd} %`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.();
  }, [lines, completionSuggestions]);

  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  };

  useEffect(
    () => () => {
      clearAllTimers();
      busyRef.current = false;
    },
    []
  );

  const appendLines = (newLines) => {
    setLines((currentLines) => capTerminalLines([...currentLines, ...newLines]));
  };

  const scheduleTimer = (callback, delay) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  };

  const printProgressively = (texts, delay = 400) => {
    if (!texts.length) return;
    busyRef.current = true;
    texts.forEach((text, index) => {
      scheduleTimer(() => {
        appendLines([createLine(text)]);
        if (index === texts.length - 1) busyRef.current = false;
      }, delay * (index + 1));
    });
  };

  const cancelProgressiveOutput = () => {
    if (!busyRef.current) return false;
    clearAllTimers();
    busyRef.current = false;
    appendLines([createLine("^C", { tone: "muted" })]);
    return true;
  };

  const downloadCv = () => {
    const link = document.createElement("a");
    link.href = `${process.env.PUBLIC_URL}/CV-Milo-Roche-2026.pdf`;
    link.download = "CV-Milo-Roche-2026.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const neofetch = () => {
    const uptime = Math.round((Date.now() - mountTimeRef.current) / 1000);
    const art = [
      "                    'c.         ",
      "                 ,xNMM.         ",
      "               .OMMMMo          ",
      "               OMMM0,           ",
      "     .;loddo:' loolloddol;.     ",
      "   cKMMMMMMMMMMNWMMMMMMMMMM0:   ",
      " .KMMMMMMMMMMMMMMMMMMMMMMMWd.   ",
      " XMMMMMMMMMMMMMMMMMMMMMMMX.     ",
      ";MMMMMMMMMMMMMMMMMMMMMMMM:      ",
      ":MMMMMMMMMMMMMMMMMMMMMMMM:      ",
      ".MMMMMMMMMMMMMMMMMMMMMMMMX.     ",
      " kMMMMMMMMMMMMMMMMMMMMMMMMWd.   ",
      " .XMMMMMMMMMMMMMMMMMMMMMMMMMMk  ",
      "  .XMMMMMMMMMMMMMMMMMMMMMMMMK.  ",
      "    kMMMMMMMMMMMMMMMMMMMMMMd    ",
      "     ;KMMMMMMMWXXWMMMMMMMk.     ",
      "       .cooc,.    .,coo:.       ",
    ];
    const infos = [
      "visiteur@milo-portfolio",
      "-----------------------",
      `OS: miloOS ${version.version} (clone macOS)`,
      "Host: Portfolio de Milo Roche-Vandenbroucque",
      "Kernel: ReactJS 18 + SCSS",
      "Shell: zsh (émulé, soyons honnêtes)",
      "Résolution: celle de votre écran 😉",
      `Uptime: ${uptime} secondes`,
      "Auteur: Entrepreneur & Formateur 🦁",
      "Fondateur: leonis-formation.fr",
    ];
    return art.map(
      (artLine, index) => artLine + (infos[index] !== undefined ? infos[index] : "")
    );
  };

  const execute = (raw, nextHistory) => {
    const trimmed = raw.trim();
    if (!trimmed) return { lines: [] };
    const [rawCommand, ...args] = trimmed.split(/\s+/);
    const command = rawCommand.toLocaleLowerCase("fr-FR");
    const arg = args.join(" ");

    if (command === "sudo") {
      if (trimmed.replace(/\s+/g, " ").startsWith("sudo rm -rf")) {
        return {
          progressive: [
            "Suppression de /System… ok",
            "Suppression de /Users… ok",
            "Suppression de /Applications… ok",
            "Suppression du portfolio de Milo…",
            "❌ Erreur : opération refusée.",
            "Vous pensiez vraiment que j'allais laisser passer ça ? 😏",
            "Rassurez-vous : rien n'a été supprimé. Tout va bien.",
          ],
        };
      }
      return {
        lines: [
          "visiteur is not in the sudoers file.",
          "This incident will be reported. 👮",
        ],
      };
    }

    switch (command) {
      case "help":
        return {
          lines: [
            "Commandes disponibles :",
            "  about             qui suis-je ?",
            "  ls, cd            explorer les fichiers",
            "  cat <fichier>     afficher un fichier",
            "  projets           lister mes projets",
            "  open <cible>      github, linkedin, leonis, projets ou cv",
            "  history           historique local des commandes",
            "  man <commande>    manuel d’une commande",
            "  neofetch          informations système",
            "  whoami, echo, date, pwd, clear, exit",
            "",
            "Astuces : ↑/↓ pour l’historique, Tab pour les propositions.",
            "Ctrl + C annule une sortie en cours.",
            "Et il paraît qu’un `sudo rm -rf /` traîne par ici… 👀",
          ],
        };
      case "about":
        return {
          lines: [
            "Milo Roche-Vandenbroucque — Entrepreneur & Formateur 🦁",
            "",
            "Fondateur de Leonis (ex-Collecty'form), organisme de formation",
            "professionnelle : sport en entreprise, bien-être/QVT et",
            "sécurité-secourisme (SST, incendie). J'interviens aussi en",
            "études supérieures (dev web, gestion de projet, conception).",
            "",
            "Avant ça : concepteur-développeur full-stack chez Bouygues",
            "Telecom, et ce portfolio est fait main en ReactJS.",
            "Tapez `cat cv.txt` ou `projets` pour en voir plus.",
          ],
        };
      case "ls": {
        const normalizedPath = arg.replace(/\/$/, "");
        if (cwd === "~/projets" || normalizedPath === "projets") {
          return { lines: [projectsList.projects.map((project) => project.name).join("   ")] };
        }
        if (!arg || arg === "." || arg === "~") {
          return { lines: ["contact.txt   cv.txt   projets/   stack.txt   CV.pdf"] };
        }
        return { lines: [`ls: ${arg}: No such file or directory`] };
      }
      case "cd": {
        const target = arg.replace(/\/$/, "");
        if (!target || target === "~" || target === "/Users/visiteur/portfolio") {
          setCwd("~");
          return { lines: [] };
        }
        if (target === "projets" && cwd === "~") {
          setCwd("~/projets");
          return { lines: [] };
        }
        if (target === ".." && cwd === "~/projets") {
          setCwd("~");
          return { lines: [] };
        }
        if (target === "." || (target === "projets" && cwd === "~/projets")) {
          return { lines: [] };
        }
        return { lines: [`cd: no such file or directory: ${arg}`] };
      }
      case "cat":
        if (!arg) {
          return { lines: ["cat: il manque un nom de fichier (essayez `cat cv.txt`)"] };
        }
        if (FILES[arg] && cwd === "~") return { lines: FILES[arg] };
        return { lines: [`cat: ${arg}: No such file or directory`] };
      case "projets":
        return {
          lines: projectsList.projects.map(
            (project) =>
              `${project.name.padEnd(14)} ${project.when.padEnd(11)} ${project.languages.join(", ")}`
          ),
        };
      case "open":
        if (LINKS[arg]) {
          window.open(LINKS[arg], "_blank", "noopener");
          return { lines: [`Ouverture de ${LINKS[arg]}…`] };
        }
        if (arg === "projets") {
          openWindow?.("projects");
          return { lines: ["Ouverture de l’application Projets…"] };
        }
        if (arg === "cv" || arg.toLocaleLowerCase("fr-FR") === "cv.pdf") {
          downloadCv();
          return { lines: ["Téléchargement de CV.pdf…"] };
        }
        return {
          lines: [
            `open: cible inconnue « ${arg} » (github, linkedin, leonis, projets, cv)`,
          ],
        };
      case "history":
        return {
          lines: [...nextHistory]
            .reverse()
            .map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`),
        };
      case "man":
        if (!arg) return { lines: ["Quel manuel ? Essayez `man open`."] };
        return MANUAL[arg.toLocaleLowerCase("fr-FR")]
          ? {
              lines: [
                `${arg.toLocaleUpperCase("fr-FR")}(1)`,
                "",
                ...MANUAL[arg.toLocaleLowerCase("fr-FR")],
              ],
            }
          : { lines: [`Aucune entrée de manuel pour ${arg}`] };
      case "neofetch":
        return { lines: neofetch() };
      case "whoami":
        return {
          lines: ["visiteur", "Mais la vraie question, c'est qui je suis : tapez `about` 😉"],
        };
      case "echo":
        return { lines: [arg] };
      case "date":
        return { lines: [new Date().toLocaleString("fr-FR")] };
      case "pwd":
        return {
          lines: [`/Users/visiteur/portfolio${cwd === "~/projets" ? "/projets" : ""}`],
        };
      case "clear":
        return { clear: true };
      case "exit":
        return { exit: true };
      default:
        return { lines: [`zsh: command not found: ${rawCommand}`] };
    }
  };

  const runCommand = (commandOverride) => {
    if (busyRef.current) return;
    const raw = typeof commandOverride === "string" ? commandOverride : input;
    setInput("");
    setHistoryIndex(-1);
    setCompletionSuggestions([]);

    let nextHistory = history;
    if (raw.trim()) {
      nextHistory = [raw, ...history].slice(0, MAX_HISTORY_ENTRIES);
      setHistory(nextHistory);
      saveCommandHistory(nextHistory);
    }

    const result = execute(raw, nextHistory);
    if (result.clear) {
      setLines([]);
      return;
    }
    if (result.exit) {
      closeWindow?.();
      return;
    }

    const output = (result.lines || []).map((text) => createLine(text));
    appendLines([createLine(raw, { prompt: true, promptText: prompt }), ...output]);
    if (result.progressive) printProgressively(result.progressive);
  };

  const applyCompletion = (candidate, addSpace = true) => {
    const context = getCompletionContext(input);
    setInput(
      `${input.slice(0, context.replacementStart)}${candidate}${addSpace ? " " : ""}`
    );
    if (addSpace) setCompletionSuggestions([]);
    inputRef.current?.focus();
  };

  const completeInput = () => {
    const context = getCompletionContext(input);
    if (!context.candidates.length || (!input.trim() && !context.partial)) {
      setCompletionSuggestions([]);
      return;
    }
    if (context.candidates.length === 1) {
      applyCompletion(context.candidates[0]);
      return;
    }

    const commonPrefix = longestCommonPrefix(context.candidates);
    if (commonPrefix.length > context.partial.length) {
      setInput(`${input.slice(0, context.replacementStart)}${commonPrefix}`);
    }
    setCompletionSuggestions(context.candidates);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key.toLocaleLowerCase("fr-FR") === "c") {
      event.preventDefault();
      if (!cancelProgressiveOutput()) {
        setInput("");
        setHistoryIndex(-1);
        setCompletionSuggestions([]);
      }
      return;
    }
    if (event.ctrlKey && event.key.toLocaleLowerCase("fr-FR") === "l") {
      event.preventDefault();
      setLines([]);
      return;
    }
    if (event.key === "Enter") {
      runCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
        setCompletionSuggestions([]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
      setCompletionSuggestions([]);
    } else if (event.key === "Tab") {
      event.preventDefault();
      completeInput();
    }
  };

  const handleFile = (file) => {
    const command = {
      "contact.txt": "cat contact.txt",
      "cv.txt": "cat cv.txt",
      "stack.txt": "cat stack.txt",
      "CV.pdf": "open cv",
      "projets/": "cd projets",
    }[file];
    if (command) runCommand(command);
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  return (
    <section
      className="terminal-app"
      data-theme={theme}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-theme-bar" onClick={(event) => event.stopPropagation()}>
        <span>Profil</span>
        <div aria-label="Thème du Terminal">
          {THEMES.map((terminalTheme) => (
            <button
              type="button"
              className={theme === terminalTheme.id ? "active" : ""}
              aria-pressed={theme === terminalTheme.id}
              onClick={() => changeTheme(terminalTheme.id)}
              key={terminalTheme.id}
            >
              <i className={terminalTheme.id} />
              {terminalTheme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="terminal-output" aria-live="polite">
        {lines.map((line) => (
          <div className={`line${line.tone ? ` ${line.tone}` : ""}`} key={line.id}>
            {line.prompt && <span className="prompt">{line.promptText || prompt}</span>}
            <InteractiveText text={line.text} onFile={handleFile} />
          </div>
        ))}

        {completionSuggestions.length > 0 && (
          <div className="terminal-completions" aria-label="Propositions de complétion">
            <span>{completionSuggestions.length} propositions</span>
            <div>
              {completionSuggestions.map((suggestion) => (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    applyCompletion(suggestion);
                  }}
                  key={suggestion}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="line input-line">
          <span className="prompt">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCompletionSuggestions([]);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Ligne de commande"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
