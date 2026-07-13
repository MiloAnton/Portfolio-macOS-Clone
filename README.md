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
