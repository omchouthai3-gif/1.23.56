# Build BeejRakshak Android APK with GitHub Actions

## Build automatically

The repository contains `.github/workflows/build-apk.yml`.

1. Push the project to the `main` or `master` branch, or open **Actions**.
2. Select **Build BeejRakshak Android APK**.
3. For a manual build, click **Run workflow**.
4. Open the completed run and download **BeejRakshak-debug-apk** from Artifacts.
5. Extract the artifact to get `app-debug.apk`.

The workflow installs Node.js 22, Temurin Java 21, Android SDK API 36 and Gradle 8.14.3. It installs npm dependencies without relying on a lockfile, builds the Vite app, runs Capacitor sync, builds the Android debug APK and verifies the artifact before upload.

## Backend configuration

The APK build workflow reads the GitHub repository **Variable** `VITE_API_BASE_URL` and embeds that public HTTPS API origin in the Android app. If the variable is empty, the APK still builds and offline features remain available, but Android AI inspection, cloud Inspector Desk synchronization and Gemini TTS stay disabled.

Deploy `server.ts` separately as a Node.js service. Set `GEMINI_API_KEY` only in the backend host's server-side environment variables. Do not pass it to the Vite build, add it to a `VITE_*` variable, or place it inside the APK. See `BACKEND_DEPLOYMENT.md` for the setup checklist.

## Android toolchain

This project uses Capacitor 8. The matching Android settings are:

- Android Gradle Plugin: 8.13.0
- Gradle: 8.14.3
- JDK: 21
- compileSdk / targetSdk: 36
- minSdk: 24 (Capacitor 8 requirement)

A debug APK is intended for testing. A Play Store release requires a properly signed release build.
