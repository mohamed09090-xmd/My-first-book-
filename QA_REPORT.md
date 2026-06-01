# QA Report

## Scope

This report covers the enhanced static website version of **The Last Train Home**.

## Implemented Improvements

- Added a static TOTP authenticator gate before the storybook.
- Added pure JavaScript TOTP verification without external libraries.
- Added session-based unlocking with `sessionStorage`.
- Added a **Lock Story** button for clearing access.
- Added `AUTH_SETUP.md` with manual authenticator configuration.
- Replaced fixed `setTimeout` page-transition completion with `animationend` event handling.
- Removed unused CSS related to the old reverse page animation.
- Cleaned the Instagram URL to `https://www.instagram.com/_gm0h/`.
- Added favicon and app icon.
- Added Open Graph and Twitter metadata.
- Added final-page “Read Again” functionality.
- Added a “Before You Read” page.
- Improved book realism with paper texture, page-edge styling, and binding shadows.
- Improved cover presentation with a subtitle and creator credit.
- Improved reverse page animation to avoid a blank background while navigating backward.
- Added page-side tap navigation.
- Improved mobile scrolling behavior.
- Added basic PWA files: `manifest.json` and `sw.js`.
- Removed external font loading for better offline behavior.
- Added `CHANGELOG.md`.

## Static Checks Performed

- JavaScript syntax check passed with Node.js.
- CSS brace balance check passed.
- Required local files and assets are present.
- Local asset references in `index.html` resolve correctly.
- `manifest.json` is valid JSON.
- Static TOTP implementation was checked against a Python HMAC-SHA1 reference implementation.
- The project contains 11 storybook pages.
- Project files contain no Arabic characters.
- No external font dependency remains.
- Page count is handled dynamically by JavaScript.

## Notes

Service worker caching works only when the project is opened from a local or remote server. It does not work from a direct `file://` URL because browsers block service workers in that mode.

A headless browser test was attempted in the build environment, but browser navigation was blocked by the sandbox policy. A final visual browser test is still recommended after deployment because page-turn rendering can vary slightly across browsers and GPU drivers.

The authenticator gate is static-only. It is useful for casual access control, but it is not a substitute for backend authentication.

## Performance update check

Version 1.6 added preload and caching improvements:

- HTML preload and prefetch links were added.
- Runtime Cache Storage warming was added.
- Service Worker cache version was updated.
- Story images are decoded in the background.
- Book pages are warmed after unlock to reduce first-flip repaint issues.
