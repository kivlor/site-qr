# Releasing Site QR

Two distribution channels, each with a one-time setup and a repeatable release step:

- **Firefox**: listed on [addons.mozilla.org](https://addons.mozilla.org) (AMO). Free, all it takes is an account.
- **Safari**: distributed as a Mac app through the Mac App Store or as a notarized Developer ID app. Requires a paid [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year).

Before any release, bump `version` in `extension/manifest.json`. The Firefox build inherits it, and the Safari app's `MARKETING_VERSION` (in the Xcode project) should match.

## Firefox (addons.mozilla.org)

### One-time setup

1. Create an account on [addons.mozilla.org](https://addons.mozilla.org/developers/).
2. Decide the final add-on ID. The build currently uses `site-qr@site-qr.local`. Once AMO signs the first version, the ID is locked to your account forever — switch it to something durable (e.g. `site-qr@yourdomain.example`) in `scripts/build.mjs` before your first submission.
3. (Optional, for command-line submission) Generate API credentials on the [AMO manage API keys](https://addons.mozilla.org/developers/addon/api/key/) page and store them securely — the key name must match the add-on ID of the channel you're submitting to.

### Releasing a version

```sh
bun run firefox:build
```

This builds `build/firefox/`, lints it with `web-ext lint`, and packages `build/firefox-packages/site_qr-<version>.zip`. Submit that zip either way:

- **Website**: open your add-on page on AMO → *Versions* → *Upload a new version* and upload the zip.
- **Command line**:
  ```sh
  npx web-ext submit \
    --source-dir build/firefox \
    --channel listed \
    --api-key $AMO_KEY \
    --api-secret $AMO_SECRET
  ```

AMO runs automated checks, then a human reviewer. Simple extensions using only `activeTab` typically pass quickly, but approval can take days — the version goes live on your listing page automatically once approved. If a reviewer requests changes, respond in the AMO review queue.

To distribute without a public listing (e.g. from your own site), submit with `--channel unlisted` instead; the resulting signed xpi can be installed directly by users, though Firefox still requires AMO signing for standard installation.

## Safari

The Safari extension ships inside the native "Site QR" app in `safari/`. Users enable it from Safari → Settings → Extensions after installing the app. The Debug configuration and ad-hoc signing used during development are not distributable — a release build must be signed by Apple.

### One-time setup

1. Join the [Apple Developer Program](https://developer.apple.org/programs/).
2. Pick a distribution route:
   - **Mac App Store**: best discoverability; users install from the App Store, and macOS auto-enables the extension flow. The app must pass Apple review.
   - **Developer ID (outside the App Store)**: distribute the app yourself (download from your site, Homebrew, etc.). No Apple review of the listing, but the app must be notarized or users get scary Gatekeeper warnings.
3. In Xcode, open `safari/Site QR/Site QR.xcodeproj`, select the project → *Signing & Capabilities*, and set your team for both the app and extension targets. For App Store distribution use the "Apple Distribution" certificate; for Developer ID use "Developer ID Application". Xcode can create/download these for you.
4. Register the bundle identifiers (`com.siteqr.app`, `com.siteqr.app.Extension`) under your team's identifiers, or let Xcode's automatic signing handle it.

### Releasing a version

1. Update `version` in `extension/manifest.json` and `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` in the Xcode project, then rebuild the browser resources so Safari picks up the new version:
   ```sh
   bun run build
   ```
2. Build the release app:
   ```sh
   xcodebuild -project 'safari/Site QR/Site QR.xcodeproj' -scheme 'Site QR' \
     -configuration Release -derivedDataPath build build
   ```
   Or archive with Xcode (*Product → Archive*) when distributing via the App Store.

Then follow the route you chose:

**Mac App Store** (in Xcode's Organizer, or via App Store Connect):

1. Create the app record in [App Store Connect](https://appstoreconnect.apple.com) with the bundle ID and a name/screenshots/description. Safari extensions benefit from a screenshot showing the QR popup.
2. Validate and upload the archive from Xcode Organizer (or the Transporter app).
3. Fill in App Store listing metadata, submit for Apple review, and release once approved. First reviews usually take a few days.

**Developer ID**:

1. Build the Release app with the Developer ID signing identity.
2. Notarize it and staple the ticket:
   ```sh
   xcrun notarytool submit 'build/Build/Products/Release/Site QR.app' \
     --keychain-profile AC_NOTARY --wait
   xcrun stapler staple 'build/Build/Products/Release/Site QR.app'
   ```
   (`notarytool` profile is created once via `xcrun notarytool store-credentials` with an app-specific password from your Apple ID.)
3. Zip the `.app` and publish it — e.g. attach it to a GitHub release on this repository.

## Release checklist

- [ ] `version` bumped in `extension/manifest.json` (and Xcode `MARKETING_VERSION` for Safari)
- [ ] `bun test` passes (QR round-trip decode)
- [ ] `bun run firefox:build` succeeds with no lint errors
- [ ] Firefox zip submitted to AMO (`--channel listed`), review requested/approved
- [ ] Safari: team + distribution certificate set in Xcode, Release build succeeds
- [ ] Safari: archive uploaded to App Store Connect **or** app notarized and stapled
- [ ] Tag the release commit, e.g. `git tag v1.0.0 && git push --tags`
