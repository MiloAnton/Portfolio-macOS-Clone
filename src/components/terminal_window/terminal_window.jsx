import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./terminal_window.scss";
import listStack from "./../../ressources/listStack.json";
import projectsList from "./../../ressources/listProjects.json";
import experienceList from "./../../ressources/listExperiences.json";
import version from "./../../../package.json";
import { useEffect, useRef, useState } from "react";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";

const PROMPT = "visiteur@milo ~ %";

const COMMANDS = [
  "help",
  "about",
  "ls",
  "cat",
  "projets",
  "open",
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

const FILES = {
  "cv.txt": experienceList.experiences.map(
    (xp) => `${xp.timeline.padEnd(14)} ${xp.poste} @ ${xp.entreprise}`
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

const welcomeLines = [
  { prompt: false, text: `Last login: ${new Date().toLocaleString("fr-FR")} on ttys001` },
  { prompt: false, text: "Bienvenue dans le terminal de mon portfolio ! Tapez `help` pour commencer." },
];

export default function TerminalWindow(props) {
  const defaultPosition = {
    x: Math.round(
      Math.min(window.innerWidth * 0.57, window.innerWidth - 744) - 200
    ),
    y: Math.round(
      Math.min(window.innerHeight * 0.505, window.innerHeight - 570) - 40
    ),
  };
  const { position, handleDragStop } = usePersistentWindowPosition(
    "terminal",
    720,
    480,
    {
      initialPosition: defaultPosition,
      storageKeySuffix: "showcase-layout",
    }
  );
  const [lines, setLines] = useState(welcomeLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const mountTime = useRef(Date.now());
  const busyRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [lines]);

  const print = (texts) =>
    texts.map((text) => ({ prompt: false, text }));

  const printProgressively = (texts, delay = 400) => {
    busyRef.current = true;
    texts.forEach((text, index) => {
      setTimeout(() => {
        setLines((prev) => [...prev, { prompt: false, text }]);
        if (index === texts.length - 1) {
          busyRef.current = false;
        }
      }, delay * (index + 1));
    });
  };

  const neofetch = () => {
    const uptime = Math.round((Date.now() - mountTime.current) / 1000);
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

  const execute = (raw) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      return { lines: [] };
    }
    const [command, ...args] = trimmed.split(/\s+/);
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
            "  about            qui suis-je ?",
            "  ls               liste les fichiers",
            "  cat <fichier>    affiche un fichier",
            "  projets          liste mes projets",
            "  open <lien>      ouvre github, linkedin ou leonis",
            "  neofetch         infos système",
            "  whoami, echo, date, pwd, clear, exit",
            "",
            "Astuces : ↑/↓ pour l'historique, Tab pour compléter.",
            "Et il paraît qu'un `sudo rm -rf /` traîne par ici… 👀",
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
      case "ls":
        if (arg === "" || arg === ".") {
          return { lines: ["contact.txt   cv.txt   projets/   stack.txt"] };
        }
        if (arg.replace(/\/$/, "") === "projets") {
          return {
            lines: [projectsList.projects.map((p) => p.name).join("   ")],
          };
        }
        return { lines: [`ls: ${arg}: No such file or directory`] };
      case "cat":
        if (arg === "") {
          return { lines: ["cat: il manque un nom de fichier (essayez `cat cv.txt`)"] };
        }
        if (FILES[arg]) {
          return { lines: FILES[arg] };
        }
        return { lines: [`cat: ${arg}: No such file or directory`] };
      case "projets":
        return {
          lines: projectsList.projects.map(
            (p) => `${p.name.padEnd(14)} ${p.when.padEnd(11)} ${p.languages.join(", ")}`
          ),
        };
      case "open":
        if (LINKS[arg]) {
          window.open(LINKS[arg], "_blank", "noopener");
          return { lines: [`Ouverture de ${LINKS[arg]}…`] };
        }
        return {
          lines: [`open: lien inconnu « ${arg} » (github, linkedin, leonis)`],
        };
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
        return { lines: ["/Users/visiteur/portfolio"] };
      case "clear":
        return { clear: true };
      case "exit":
        return { exit: true };
      default:
        return { lines: [`zsh: command not found: ${command}`] };
    }
  };

  const runCommand = () => {
    if (busyRef.current) {
      return;
    }
    const raw = input;
    setInput("");
    setHistoryIndex(-1);
    if (raw.trim() !== "") {
      setHistory((prev) => [raw, ...prev]);
    }
    const echoLine = { prompt: true, text: raw };
    const result = execute(raw);
    if (result.clear) {
      setLines([]);
      return;
    }
    if (result.exit) {
      props.handleClose();
      return;
    }
    setLines((prev) => [...prev, echoLine, ...print(result.lines || [])]);
    if (result.progressive) {
      printProgressively(result.progressive);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      runCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      const match = COMMANDS.find((cmd) => cmd.startsWith(input.trim()));
      if (input.trim() !== "" && match) {
        setInput(match + " ");
      }
    } else if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      setLines([]);
    } else if (event.ctrlKey && event.key === "c") {
      setInput("");
      setHistoryIndex(-1);
    }
  };

  const handleQuit = () => {
    props.handleClose();
  };

  const handleFullscreen = () => {
    props.fullScreen();
  };

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className="App"
        style={
          props.isMinimized ? { display: "none" } : { zIndex: props.zIndex }
        }
        onMouseDownCapture={() => props.handleClickZIndex()}
        width={720} // Largeur initiale de la fenêtre
        height={480} // Hauteur initiale de la fenêtre
        minConstraints={[400, 250]} // Largeur et hauteur minimales
        maxConstraints={[2560, 1440]} // Largeur et hauteur maximales
        resizeHandles={["se"]} // Redimensionner uniquement depuis le coin inférieur droit
      >
        <MenuBar handleFullscreen={handleFullscreen} handleQuit={handleQuit} />
        <section
          className="terminal-app"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, index) => (
            <div className="line" key={index}>
              {line.prompt && <span className="prompt">{PROMPT}</span>}
              {line.text}
            </div>
          ))}
          <div className="line input-line">
            <span className="prompt">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
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
        </section>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
