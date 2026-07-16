# Online portfolio

This is the repository on wich you can find the source code of my [online portfolio](https://miloroche.fr).

![demo image](./src/assets/demo.png)

## Description

This website mimics the macOS operating system to offer a different user experience during navigation. The dock, windows, and menu bar are functional.

## Stack

Are used in this project :

1. [ReactJS](https://reactjs.org/) / JavaScript
2. [SCSS](https://sass-lang.com/) with sass preprocessor
3. [Draggable](https://www.npmjs.com/package/react-draggable) npm package
4. [Resizeable](https://www.npmjs.com/react-resizeable) npm package

## Changelog

### 0.12.3
- Replaced Safari's typographic home, reload and external-link symbols with a consistent lightweight SVG icon set across the toolbar
- Turned reload into a stop control while an iframe is loading, with safe invalidation of any later load event
- Added `⌘/Ctrl + L` to focus and select the address bar and `⌘/Ctrl + R` to reload the current page
- Kept native Enter submission in the address bar for normalized HTTP and HTTPS navigation
- Added versioned localStorage persistence for up to 24 favorites and the 100 most recent visits
- Added a toolbar favorite toggle plus removable favorite cards on the start page
- Added a dedicated, persistent history page with visit dates, direct reopening and a clear-history action
- Scoped Safari keyboard shortcuts to the visible, foreground window
- Attached a generation to every iframe navigation and reload so stale frames cannot change the current loading state
- Added a permanently accessible external-tab escape hatch with honest guidance about undetectable cross-origin iframe blocking
- Added Safari URL, loading, stale-iframe, shortcut, favorite, history, external-tab and validation regression tests (98 tests across 22 suites)

### 0.12.2
- Added a privacy-first FaceTime lobby that waits for an explicit action before requesting camera access
- Added a live pre-call camera preview with Milo's avatar and a dedicated “Rejoindre” action
- Added a real “Caméra coupée” screen instead of leaving a black video feed
- Added microphone controls with graceful audio-only permission failure and a clear in-call status
- Added post-permission camera discovery and safe switching between available video devices
- Added an optional mirror mode for the local camera preview
- Reset the call timer on every new call and stop it whenever the call ends
- Added distinct states for denied permission, missing hardware, unsupported browsers and technical camera failures, each with a retry action
- Made pending camera and microphone permissions cancellation-safe when FaceTime is minimized, closed or unmounted
- Added FaceTime privacy, preview, device, control, timer, error-classification and media-cleanup regression tests (89 tests across 21 suites)

### 0.12.1
- Added a timestamp beneath every message and a live latest-message time in the conversation list
- Added outgoing “Distribué” and “Lu” states, with replies marking their corresponding message as read
- Added a subtle arrival animation for newly sent and received bubbles with reduced-motion support
- Persisted the full local conversation, timestamps and delivery states in versioned localStorage
- Added a real “Effacer la conversation” action that restores the welcome exchange
- Added clickable “Tes projets”, “Ta stack” and “Te contacter” suggestions
- Turned the decorative composer plus button into a functional suggestions toggle
- Removed the decorative new-conversation button from the sidebar
- Replaced timestamp-only IDs with `crypto.randomUUID` and a unique fallback generator
- Added generation-safe reply cancellation for clearing, replacing or unmounting the conversation
- Converted the sidebar into a collapsible overlay using its own container width on narrow windows
- Added Messages persistence, status, suggestion, clearing, unique-ID, responsive-sidebar and timer-cleanup regression tests (83 tests across 21 suites)

### 0.11.10
- Rebuilt the Simon board with a substantial physical shell, recessed colored pads, central round display and responsive circular proportions
- Added stronger color halos during playback plus a distinct inset press animation for player feedback
- Added four Web Audio oscillator tones with smooth gain envelopes, initialized only after a user gesture
- Progressively shortened sequence steps and flashes while retaining readable minimum timing limits
- Added a strict mode that resets to the first round after an error, while normal mode replays the current sequence
- Centralized every playback, user-flash, round-pause and error-pause timeout in one tracked scheduler
- Fully disabled all four color buttons during demonstrations and error transitions
- Cancelled every pending timer and closed the AudioContext when Simon is closed or another game replaces it
- Allowed switching strict mode safely by cancelling the current game and returning to the ready state
- Added Simon timing, scheduler, Web Audio, demonstration-lock, strict-mode and unmount-cleanup regression tests (77 tests across 20 suites)

### 0.11.9
- Rebuilt Frogger as a nine-row world with a start area, three road lanes, a safe median, three river lanes and five arrival bays
- Added detailed frog, car and log sprites alongside animated water, roads, lane markings and filled lily-pad homes
- Added five distinct arrival zones, three lives, a 30-second crossing timer and successive levels
- Increased vehicle and log speed by 12% per completed set of five arrivals
- Replaced free movement with a strict 13-column grid where every accepted input moves exactly one cell
- Added a compact tactile directional pad using the same one-cell movement rules
- Defined “Rejouer” as a complete new game that resets crossings, lives, time, level and occupied arrivals
- Ignored keyboard auto-repeat and added a short shared input cadence to prevent accidental multi-cell jumps
- Added inset frog hitboxes and swept vehicle collisions while avoiding false hits when vehicles wrap around the screen
- Made cars, logs, carried-frog movement and the timer independent from display refresh rate
- Added Frogger timing, grid movement, input-repeat, swept-collision and touch-control regression tests (71 tests across 19 suites)

### 0.11.8
- Replaced the rectangular player with an expressive animated character whose limbs move while airborne
- Diversified platform rendering with grassy static, directional moving and visibly cracked breakable variants
- Added horizontally moving platforms, collapsing platforms and animated high-jump springs
- Added floating star bonuses with a temporary boost, score reward and visual feedback
- Added holdable left and right touch controls for mobile play
- Added optional device-tilt steering with explicit iOS motion-permission handling and graceful unsupported states
- Guaranteed a wide, fixed starting platform directly beneath the initial player position
- Replaced narrow landing bands with swept landing detection so fast falls cannot pass through platforms
- Made gravity, horizontal steering, moving platforms, breaking and scrolling independent from display refresh rate
- Added Doodle Jump timing, safe-start, swept-landing, moving-platform, touch and tilt regression tests (66 tests across 18 suites)

### 0.11.7
- Replaced rectangular invaders and the player ship with animated, multicolored pixel-art sprites
- Added particle explosions, glowing projectiles, muzzle flashes and a subtle animated star field
- Added enemy projectiles, three player lives, temporary hit protection and progressively faster firing
- Added successive waves with denser formations, increasing movement speed and visible wave announcements
- Added a controlled player firing cadence for both held keyboard and touch input
- Added accessible touch controls for moving left, firing and moving right
- Removed destroyed and off-screen player or enemy projectiles every frame to keep their arrays bounded
- Clamped enemy formations at screen edges so they reverse and descend exactly once per boundary contact
- Reordered collision checks so an invader destroyed during a frame cannot still trigger defeat in that frame
- Added Space Invaders timing, cleanup, formation, collision, wave and touch-control regression tests (61 tests across 17 suites)

### 0.11.6
- Added smooth tile movement animations followed by distinct merge and spawn effects
- Rebuilt the 2048 board as a fluid square that remains playable in narrow game windows
- Added explicit victory and game-over overlays, including the option to continue after reaching 2048
- Added horizontal and vertical touch gestures alongside keyboard controls
- Added one-move undo through the interface or `⌘/Ctrl + Z`
- Added a persistent local best score that is preserved when a move is undone
- Detected blocked full boards immediately instead of leaving the game silently frozen
- Locked directional input during tile animations to prevent overlapping or inconsistent moves
- Added 2048 movement, status, animation-lock, undo, touch and record regression tests (56 tests across 16 suites)

### 0.11.5
- Redesigned Flappy Bird with an animated wing, expressive rotation and a more detailed bird
- Added scrolling ground, two-layer parallax clouds and shaded pipes with distinct caps and highlights
- Added pointer and touch controls alongside the existing keyboard controls
- Added a preparation screen, replay feedback and a persistent local best score
- Added progressive difficulty that increases pipe speed and gradually narrows their gaps
- Awarded points as soon as the bird fully passes a pipe instead of waiting for off-screen recycling
- Made gravity, movement and scenery scrolling independent from display refresh rate
- Replaced coarse rectangular bird collisions with a forgiving circular hitbox against detailed pipe sections
- Added Flappy Bird timing, difficulty, scoring, collision and pointer-control regression tests (51 tests across 15 suites)

### 0.11.4
- Replaced rectangular cars with detailed top-down canvas sprites, windows, lights, wheels and shadows
- Redesigned the track with animated lane markings, red-and-white shoulders, grass gradients and scrolling scenery
- Added acceleration, braking and smooth three-lane changes with arrow keys or WASD
- Added progressive difficulty affecting traffic speed and real-time spawn frequency
- Added a three-hit damage gauge, temporary impact protection and visible collision feedback
- Made driving speed, distance, road scrolling, traffic and spawning independent from display refresh rate
- Removed traffic after it leaves the play area to prevent an ever-growing obstacle array
- Added safe wave generation that always preserves an escapable lane
- Added Racer timing, difficulty, spawning, cleanup and damage-gauge regression tests (46 tests across 14 suites)

### 0.11.3
- Redesigned Snake with a distinct head, directional eyes and a subtle board grid
- Added a short expanding ring animation whenever an apple is eaten
- Added progressive speed from 115 ms down to a playable 55 ms movement floor, with a gentle 2 ms increase per apple
- Added a persistent local best score displayed beside the current score
- Added a 3–2–1 start countdown and pause/resume controls, including the `P` shortcut
- Added an optional wall-traversal mode with wrapping on all four board edges
- Guaranteed that new food is selected only from cells not occupied by the snake
- Added Snake food, speed, record, countdown, pause and wall-mode regression tests (41 tests across 13 suites)

### 0.11.2
- Added a subtle nine-position light trail behind the Pong ball
- Added impact flashes when the ball hits a wall or paddle
- Added a visible 3–2–1 countdown before the first serve and after every point
- Improved paddle collision direction checks to prevent repeated impacts
- Made ball, paddle, computer and flash speeds independent from the display refresh rate
- Added swept paddle collision detection so the ball cannot tunnel through a paddle at high speed
- Made each new serve travel toward the player who conceded the previous point
- Added Pong countdown, restart, frame-rate, collision and serve-direction regression tests

### 0.11.1
- Added a classic Minesweeper scoreboard with red digital mine and time counters
- Added a real game timer that starts on the first action, stops at game end and resets with a new board
- Replaced the generic replay control with an accessible central status face for playing, lost and won states
- Prevented players from placing more flags than the board's mine count
- Added deterministic Minesweeper timer, status and flag-limit regression tests (32 tests across 11 suites)

### 0.10.7
- Removed the Dock's global DOM queries, manual event listeners and imperative transforms
- Dock magnification and neighbouring icon effects are now derived from React hover state and CSS classes
- Stack animation delays in the main window are now declared directly during rendering, without refs or DOM mutations
- Split all 10 mini-games into focused, human-readable modules instead of two compact monolithic files
- Added a declarative games registry plus shared keyboard and canvas primitives to remove duplicated infrastructure
- Added Dock, main-window and games-registry regression tests (29 tests across 10 suites)

### 0.10.6
- Expanded the pre-TypeScript safety net from 10 to 24 behavioral tests across 7 suites
- Added App integration tests for opening windows from the Dock and desktop, plus foreground focus changes
- Added reducer coverage for deterministic z-index ordering, ignored focus, minimize/restore transitions and fullscreen toggling
- Added layout hook tests for loading, clamping and persisting dragged or resized window layouts
- Strengthened registry validation for unique, non-empty IDs and exact ID lookup consistency
- Added a FaceTime lifecycle test ensuring every camera track stops when its window is minimized
- Added a Games isolation test ensuring gameplay keys are captured only while Games is in the foreground

### 0.10.5
- Added a shared `WindowFrame` used by every app for macOS chrome, focus, dragging, resizing and animations
- Fullscreen now works consistently on all windows, including double-clicking the title bar and restoring the previous layout
- Window positions and resized dimensions are persisted together, migrated from the legacy format and clamped after viewport changes
- Moved window titles, size constraints, CSS classes and placement rules into the declarative window registry
- App components now contain only their own content and behavior, with no duplicated `Draggable`, `ResizableBox` or `MenuBar` setup
- Replaced duplicate drag handle IDs and clickable traffic-light divs with shared classes and accessible buttons
- FaceTime releases the camera while minimized without sacrificing the preserved state of other apps
- Added registry, layout and `WindowFrame` tests (10 tests total)

### 0.10.4
- Replaced the duplicated state and handlers in `App.jsx` with a centralized `useReducer` window manager
- Added a single declarative window registry for lazy components, Dock metadata, initial layout and default sizes
- Dock icons, open indicators and toolbar labels are now generated from the window registry
- Added reducer tests for desktop/mobile startup, focus, minimize, restore, close and fullscreen reset
- Reduced `App.jsx` from roughly 700 lines to under 200 lines, making future apps much cheaper to integrate

### 0.10.3
- Removed Google Fonts, switched to the native system font (San Francisco on Apple devices)
- Windows are now lazy-loaded with React.lazy : ~40% smaller initial bundle
- Optimized image loading (lazy loading on stack icons and logos)
- Refactored the main window : icon lookup objects and a single StackSection component instead of duplicated ternary chains

### 0.10.2
- New window animations : zoom + fade on open, simplified genie effect on close/minimize
- The yellow button now really minimizes windows into the Dock (state preserved, click the Dock icon to restore)
- Menu bar clock now uses the macOS date format ("jeu. 10 juil.")
- Bug fixes and improvements (stable window keys)

### 0.10.1
- Keyboard inputs no longer leak between apps (Calculator and Games only listen when focused)
- Saved window positions are clamped to the viewport : no more windows stranded off-screen
- The "running app" dot in the Dock is now dynamic for every open app
- Fixed invalid React keys in the main window

### 0.10.0
- Added Games App with integrated mini-games
- Added Console App 
- Added Calculator App
- Toolbar fixes
- Added a few logos

### 0.9.3
- Removed fake login page
- Added back Messages app 

### 0.9.2 
- New wallpaper (macOS Tahoe)
- Added Safari for iframe-friendly websites
- Added a few logos in "Stack maitrisée"

### 0.9.1 
- Windows now will open at the same place they were closed. 
- They also open for the first time in a random place on screen.

### 0.9.0

- Terminal App : emulated zsh with help, about, ls, cat, projets, open, neofetch, command history (↑/↓), Tab completion and a few easter eggs
- New Terminal dock icon (hand-made SVG)

### 0.8.0

- FaceTime App : visitor's webcam with Milo as caller (nothing is recorded or sent), call timer, camera toggle and hangup buttons
- Fixed dock hover crash on edge icons, neighbours now scale properly on every icon

### 0.7.0

- Notes App : create, edit and delete notes, saved in localStorage
- Notes dock icon now opens the Notes window

### 0.6.0

- Functional Projects Window (first version, based on listProjects.json)
- Merged Collecty'form into Leonis (rebranding) with new logo
- Updated experiences (France Fire ended in 2025, added Leonis activities)
- New headline: "Entrepreneur & Formateur"

### 0.5.5

- Added glassmorphism effect on Main Window

### 0.5.4
- Fixed handle on tutorial window
- Added icons on Dock for future updates
- Fixed scrollbar on tutorial window

### 0.5.3 

- Added Experiences
- Updated Education
- Updated Wallpaper

### 0.5.2

- Quit and Minimize Windows are implemented
- Updated tutorial window
- Bug fixes and improvements

### 0.5.1

- Window buttons now have icons inside them on hover
- Fixed resize indicator

### 0.5.0

- Windows are now resizeable !
- Bug fixes and improvements

### 0.4.0

- Added a fake Login page
- Added shortcuts instead of URL input on InternalBrowser
- Fixed z-index bug on InternalBrowser
- Changed animation on "session load"
- Bug fixes and improvements

### 0.3.5

- Added an internal browser to mimic safari (iframe)
- Added a Welcome Animation
- Fixes and improvements

### 0.3.4

- Added completed recent changelog in this README
- Fixed tutorial window's draggable handle
- Temporarily removed "Links" window
- Added titles on menu bar icons
- Enhanced PWA support
- New Application Icon

### 0.3.3

- Added some known tech platforms
- Added differents menus depending on focused window
- Fixed overflow on html body on some browsers
- Removed user-select on tutorial window

### 0.3.2

- Added GitHub repo's link
- Fixed z-index on newly opened window
- Updated the Dock and icons
- Fixed initial width on mobile

### 0.3.1

- Added technos icons and grid layout
- Dock icons are now loaded from the server and not an external link
- Added missing indexes on .map() functions

### 0.3.0

- Added Draggable and focused windows
- Removed background repeat
- Added basic welcome animations

### 0.2.1

- Added titles
- Fixed some CSS
- Removed package-lock

### 0.2.0

- Separated everything in different components
- Added custom scrollbar
- Added first sections and navigation toolbar
