# The Last Train Home

A responsive interactive flipbook website built with HTML, CSS, and JavaScript.

## Overview

This project presents the original short story **The Last Train Home** as a smooth digital storybook. The design uses a cinematic night-station atmosphere, a custom SVG cover, page-turn animation, touch navigation, keyboard controls, and creator credits.

## Project Structure

```text
the-last-train-book-site-auth/
├── assets/
│   ├── cover.svg
│   ├── favicon.svg
│   └── icon.svg
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
├── README.md
├── AUTH_SETUP.md
├── CHANGELOG.md
└── QA_REPORT.md
```

## Main Features

- Static TOTP authenticator gate before the storybook.
- Responsive layout for desktop, tablet, and mobile.
- Animated flipbook-style page transitions.
- Smooth reverse navigation without white flicker.
- Page navigation through buttons, keyboard arrows, swipe gestures, and page-side taps.
- A visual cover image matching the story atmosphere.
- Introductory “Before You Read” page.
- Final-page creator credit and Instagram link.
- “Read Again” button on the final page.
- Favicon and app icon.
- Open Graph and Twitter metadata for better link previews.
- Basic PWA support through `manifest.json` and `sw.js`.
- Offline-friendly font stack without external font dependencies.
- Reduced-motion support for users who prefer less animation.

## Authenticator Access

The website asks for a 6-digit authenticator code before showing the book.

Setup details are documented in `AUTH_SETUP.md`.

Important: this is a static-only protection layer. It blocks casual access, but it is not equivalent to server-side authentication because the secret exists in the public JavaScript file.

## How to Run

### Option 1: Open directly

1. Extract the ZIP file.
2. Open the folder.
3. Double-click `index.html`.

Most features work this way. Service worker caching requires a local or online server because browsers do not allow service workers from `file://` URLs.

### Option 2: Run with a simple local server

From the project folder, run one of these commands:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to Edit the Story

Open `index.html` and edit the text inside the `<article class="page">` sections.

If you add or remove pages, the JavaScript will automatically update the page counter because it counts all elements with the `.page` class.

## How to Edit the Design

Open `style.css`.

Useful sections:

- `:root` for colors, animation duration, and font stacks.
- `.page` for paper design.
- `.book` and `.book-wrap` for the book structure.
- `@keyframes pageFlipNext` and `@keyframes pageFlipPrevAway` for page-turn animation.
- Media queries near the bottom for mobile layout.

## How to Edit Behavior

Open `script.js`.

Main behaviors include:

- TOTP code verification before unlocking the story.
- `lockStory()` for clearing the current session.
- `turnPage(direction)` for page navigation.
- `restartStory()` for the final-page Read Again button.
- `handleBookClick(event)` for page-side tap navigation.
- Swipe and keyboard event listeners.

## Creator Credit

Instagram: @_gm0h  
© 2026 ghalima mohamed. Designed by ghalima mohamed. All rights reserved.

## Performance preload layer

This version includes a fast-reading preload layer. The cover image, script, app icons, and full static app are prepared early. When the site is hosted over `https://`, the Service Worker stores the app in Cache Storage so repeat visits load faster and page flipping has fewer repaint delays.

For direct `file://` opening, the app still works normally, but browser Service Worker caching is disabled by design.
