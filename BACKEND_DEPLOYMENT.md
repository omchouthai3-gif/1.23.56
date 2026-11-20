# BeejRakshak backend setup

The Android APK is a client. Gemini AI inspection, cloud Inspector Desk storage, and Gemini text-to-speech run on the separate Express service in `server.ts`.

## Deploy the API

1. Deploy this project to a Node.js hosting service that supports a persistent Node process.
2. Use Node.js 22 or newer.
3. Install dependencies with `npm install --legacy-peer-deps` (or the host's equivalent).
4. Set the start command to `npm start`.
5. Configure these server-side environment variables on the hosting service:
   - `GEMINI_API_KEY`: your Gemini API key (keep it secret).
   - `GEMINI_VISION_MODEL`: optional; defaults to `gemini-3.8-flash`.
   - `PORT`: usually supplied automatically by the hosting service.
6. Confirm that `https://YOUR-SERVICE/api/health` returns JSON with `ok: true` and `aiConfigured: true`.

The service stores Inspector Desk alerts in `data/inspector-alerts.json`. Choose a host with persistent disk/storage if alerts must survive service restarts; otherwise connect a durable database before real deployment.

## Connect the Android build

1. In GitHub, open the repository Settings → Secrets and variables → Actions → Variables.
2. Add a repository variable named `VITE_API_BASE_URL`.
3. Set its value to the backend origin, for example `https://your-service.example.com` (no trailing slash, no `/api` suffix).
4. Run the **Build BeejRakshak Android APK** workflow again.
5. Download the `BeejRakshak-debug-apk` artifact from the completed Actions run and install that newly built APK.

Never put `GEMINI_API_KEY` in `VITE_API_BASE_URL`, any `VITE_*` variable, frontend source, or the APK. The app must be rebuilt after changing `VITE_API_BASE_URL` because Vite embeds it at build time.

## Important limitations

- A connected backend is not automatically an official Agriculture Department integration. Only label reports as submitted to a government department after an authorized integration exists.
- The bundled registry records are demonstration/local data unless replaced with verified, licensed official data.
- Image inspection can flag visible packaging anomalies; it cannot prove a product's supply-chain authenticity from a photo alone.
- Use a persistent database and add authentication/rate limiting before exposing the Inspector Desk to public production traffic.
