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

## To be fixed / added

- Welcome animation freezing draggable windows
- Minimizing or opening a new window makes everything go back to it's initial position
- Correct Logo on Education
- Logos for each project on the Projects Window
- Fix the fullscreen button
- Implement a Safari App (Proof of concept)
- Implement a Message App (contact)

## Changelog

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
