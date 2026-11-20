# BeejRakshak repair notes

This repair updates the source project used to generate the Android APK.

## Changes made

- Android builds now accept `VITE_API_BASE_URL` at build time so the native app can reach a separately hosted HTTPS API.
- Removed the ineffective attempt to pass `GEMINI_API_KEY` into the frontend build. The key must remain server-side.
- Replaced the invalid `gemini-4-hydrogen` vision model ID with `gemini-3.8-flash`.
- Kept Gemini TTS on `gemini-3.8-flash-lite-tts` and wrapped raw PCM output in a WAV header when required.
- Corrected offline photo handling: the app no longer pretends it visually inspected a packet when AI is unavailable. It shows that packaging remains unchecked.
- Added an `UNVERIFIED` result for unknown batches and photos that could not be visually analysed. Unknown does not automatically mean counterfeit.
- Removed the false cloned-QR trigger caused only by repeatedly scanning the same packet on one phone. Only a batch explicitly marked cloned in the local registry triggers that rule; a shared cross-device clone service is still a future backend feature.
- Removed fixed fallback GPS coordinates. Reports now carry null coordinates when the device cannot provide a location.
- Removed the non-SHA-256 fallback hash; report creation now stops with an error if secure Web Crypto SHA-256 is unavailable.
- Updated UI wording so the bundled sample registry and local server are not represented as an official government database or Agriculture Department integration.
- Updated the dependency tree to use `esbuild` 0.28.x for Vite 8 peer compatibility and moved `tsx` into runtime dependencies for the API server.
- Updated Android cleartext traffic policy to require HTTPS for remote production APIs.

## Configuration still required for cloud features

1. Deploy `server.ts` as a Node.js service.
2. Set `GEMINI_API_KEY` on that server only.
3. Add the GitHub Actions repository variable `VITE_API_BASE_URL` with the public HTTPS origin of the deployed API.
4. Rebuild the APK through the included GitHub Actions workflow.

See `BACKEND_DEPLOYMENT.md` and `GITHUB_APK_BUILD.md`.

## Validation performed in this environment

- Parsed all 21 TypeScript/TSX source files: no syntax parse errors.
- Parsed the GitHub Actions workflow YAML successfully.
- Full TypeScript/build validation and Android APK compilation were not completed here: dependency installation timed out, and this environment does not have the Android SDK/Gradle build toolchain installed.
- No live Gemini request, camera, GPS, or physical Android runtime test was performed.
