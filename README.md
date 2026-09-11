# Site QR

Click the Safari toolbar icon, scan the QR code with your phone’s camera, and open the page. No account, settings, server, analytics, or saved history. The full URL (including query and fragment) is encoded locally. Only `activeTab` access is requested.

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

This is a local development build, signed to run locally. Safari resets the unsigned-extension setting when you quit. A normally signed distribution is a separate step. See [Apple’s local extension instructions](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension).

On Safari versions with **Add Temporary Extension** in Settings → Developer, you can also select the `dist` folder after `bun run build`, without building the app. Temporary extensions expire after 24 hours or when Safari quits.

## Development

```sh
bun run build          # Bundle the browser extension into dist/
bun test              # Independently decode rendered QR pixels
bun run safari:build   # Rebuild browser resources and the macOS app
```

`extension/` contains the popup markup, styles, and manifest. `src/qr.js` handles URL validation and QR rendering; `src/popup.js` reads the active tab. `safari/` is the thin Apple-generated native wrapper, referencing `dist/` directly. Build browser resources before building in Xcode.

The browser code uses standard WebExtension APIs and has no Safari-specific logic. A later Firefox version can reuse the same popup and QR module; Firefox packaging and testing are still to do.

Browser-internal pages and local files show a short error. Links beyond QR capacity also show an error. Very long links produce dense codes and can be harder for a phone to scan. A QR shares a URL, so pages still need to be reachable and may require sign-in on the phone.

QR encoding uses the MIT-licensed `qrcode` package; its license ships with the extension. Tests decode with the independent `jsqr` library.
