# Changelog

## Version 1.4

- Added a static TOTP authenticator gate before the storybook.
- Added a private access form with 6-digit code validation.
- Added pure JavaScript TOTP verification without external libraries.
- Added a small time-drift window for authenticator code validation.
- Added session-based access through `sessionStorage`.
- Added a **Lock Story** button to clear access.
- Added `AUTH_SETUP.md` with authenticator configuration instructions.
- Updated the service worker cache version.

## Version 1.3

- Added a “Before You Read” intro page.
- Added a “Read Again” button on the final page.
- Replaced shared Instagram URL with a clean profile URL.
- Added favicon and app icon.
- Added Open Graph and Twitter metadata.
- Added `manifest.json` and `sw.js` for basic PWA support.
- Removed external Google Fonts and switched to offline-friendly font stacks.
- Improved mobile page scrolling with `-webkit-overflow-scrolling: touch`.
- Added page-side tap navigation.
- Replaced fixed animation timing with `animationend` logic.
- Removed unused reverse-animation CSS.
- Enhanced book realism with page-edge styling, paper texture, and stronger binding shadows.
- Improved cover presentation with subtitle and creator credit.

## Version 1.2

- Fixed reverse-page white flicker by keeping the previous page visible under the turning page.
- Added stronger dark fallback backgrounds behind the book.
- Improved 3D rendering stability for browser repaint issues.
- Added a QA report.

## Version 1.1

- Added a custom cover image.
- Added Instagram credit on the final page.
- Added creator copyright text.
- Improved page-turn animation smoothness.

## Version 1.0

- Built the first responsive interactive storybook.
- Added the complete English story.
- Added basic page navigation, keyboard support, and swipe support.

## Version 1.6

- Added fast-reading preload improvements.
- Added HTML preload and prefetch hints.
- Added runtime Cache Storage warming.
- Improved Service Worker caching strategy.
- Added page rendering warm-up after authentication.
- Added performance notes documentation.
