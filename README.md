# Site QR

[![CI](https://github.com/kivlor/site-qr/actions/workflows/ci.yml/badge.svg)](https://github.com/kivlor/site-qr/actions/workflows/ci.yml)

Click the Safari or Firefox toolbar icon, scan the QR code with your phone’s camera, and open the page. No account, settings, server, analytics, or saved history. The full URL (including query and fragment) is encoded locally. Only `activeTab` access is requested.

## Try it in Safari

Requires macOS 13 or later and Safari 16 or later. Building requires Xcode and Bun (or npm).

```sh
bun install --frozen-lockfile
bun run safari:build
open 'build/Build/Products/Debug/Site QR.app'
```

1. In Safari → Settings → Advanced, enable **Show features for web developers**.
2. In Settings → Developer, enable **Allow unsigned extensions**. On Safari 16 this is under the Develop menu.
3. In Settings → Extensions, enable **Site QR**. The companion app has a button to open this panel.
4. Visit a website, click Site QR in the toolbar, and scan with your phone.

This is a local development build, signed to run locally. Safari resets the unsigned-extension setting when you quit. For publishing a properly signed distribution, see [RELEASE.md](RELEASE.md). See [Apple’s local extension instructions](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension).

On Safari versions with **Add Temporary Extension** in Settings → Developer, you can also select the `dist` folder after `bun run build`, without building the app. Temporary extensions expire after 24 hours or when Safari quits.

## Try it in Firefox

Requires Firefox 142 or later on macOS, Windows, or Linux.

```sh
bun install --frozen-lockfile
bun run firefox:build
```

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on…** and select `build/firefox/manifest.json`.
3. Open a website, then open Site QR from the extensions (puzzle piece) menu. Pin it to the toolbar for one-click access.

The same installable test package is at `build/firefox-packages/site_qr-1.0.0.zip`. Load it through **Load Temporary Add-on**, too. Temporary installs last until Firefox restarts. Permanent installation in standard Firefox requires Mozilla signing; this build is not signed or published. For publishing, see [RELEASE.md](RELEASE.md). See [Mozilla’s installation guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

For development, `bun run firefox:run` launches a separate temporary Firefox profile with the extension loaded and reloads it when build output changes. Run `node scripts/build.mjs --firefox` after source edits.

## Development

```sh
bun run build          # Bundle the browser extension into dist/
bun test              # Independently decode rendered QR pixels
bun run safari:build   # Rebuild browser resources and the macOS app
```

`extension/` contains the popup markup, styles, and manifest. `src/qr.js` handles URL validation and QR rendering; `src/popup.js` reads the active tab. `safari/` is the thin Apple-generated native wrapper, referencing `dist/` directly. Build browser resources before building in Xcode.

Safari and Firefox share all popup, icon, and QR source. The Firefox build adds only its add-on ID, minimum version, and declaration that no data is collected to a separate manifest in `build/firefox/`. Safari continues to use `dist/`.

Browser-internal pages and local files show a short error. Links beyond QR capacity also show an error. Very long links produce dense codes and can be harder for a phone to scan. A QR shares a URL, so pages still need to be reachable and may require sign-in on the phone.

QR encoding uses the MIT-licensed `qrcode` package; its license ships with the extension. Tests decode with the independent `jsqr` library.

The native app icon and welcome image are generated from `extension/icon.svg`. After changing the SVG, run `bun run icons`, then `bun run safari:build`.
