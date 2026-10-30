# CodePath static PWA

CodePath runs as a static HTML, CSS and JavaScript app. It does not use PHP, SQL, a database, or a login server. Lesson material is included in the static app and JSON files.

## Run locally

1. Serve this folder from any local web server. XAMPP Apache is one option; PHP is not required for this app.
2. Open `http://localhost/FS/`.
3. Use the app normally. Lesson completion, XP, quiz attempts, theme and language are saved in this browser's local storage.

The root `.htaccess` selects `index.html` as the default page. If the web server does not support `.htaccess`, open `index.html` directly by URL and make sure it is configured as the default document.

## Install on desktop or mobile

The app includes `manifest.json`, service worker, and 192px/512px app icons. Browsers allow PWA installation on HTTPS or localhost. For a phone, use the HTTPS deployment URL; `localhost` on the phone refers to the phone itself, and ordinary HTTP LAN addresses cannot install a service worker.

Open the app once while online, then use the browser's Install app / Add to Home Screen action. iPhone and iPad users can use Safari's Share menu and choose Add to Home Screen. Installation menus vary by browser.

## Offline and saved progress

The service worker caches the app shell, lesson content, JSON files, and icons. Visit the app online once before using it offline. Progress stays in the current browser profile on the current device. It does not sync between a laptop and phone, and clearing browser data removes it. There is no account recovery or cloud backup in this static version.

## Project files

- `index.html` — app page and embedded lesson data
- `app.js`, `static-app.js` — app interactions and local progress
- `style.css`, `lesson-content.css` — responsive layout and lesson styles
- `lesson-content.json`, `html-tutorial.json` — lesson source data
- `manifest.json`, `service-worker.js`, `offline.html` — PWA metadata and offline support
- `icons/` — app and maskable icons

The lesson topics and examples are kept as learning content; the app itself does not run PHP or SQL.
