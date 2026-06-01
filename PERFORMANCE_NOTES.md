# Performance Notes

This version adds a fast-reading preload layer for the storybook.

## What was improved

- The cover artwork is preloaded from the HTML head.
- The JavaScript file is preloaded before it is executed.
- Icon assets are prefetched early.
- The Service Worker precaches the full static app for repeat visits.
- The browser Cache Storage is warmed in the background when supported.
- Story images are decoded before reading whenever possible.
- Book pages are warmed after unlock to reduce page-flip repaint glitches.

## Why localStorage is not used for page caching

`localStorage` is synchronous, small, text-oriented storage. It is not the right place to store images, CSS, JavaScript, or page assets. For this project, Cache Storage and a Service Worker are safer and faster because they are built specifically for static web assets.

## Important limitation

Service Worker caching works when the site is served through `http://` or `https://`. It does not work from a direct `file://` opening because browsers block Service Workers on local files.
