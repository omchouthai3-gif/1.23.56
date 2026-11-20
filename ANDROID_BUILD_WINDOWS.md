# Build BeejRakshak on Windows

## Recommended: GitHub Actions

1. Push the complete project to a GitHub repository.
2. Open the **Actions** tab.
3. Select **Build BeejRakshak Android APK**.
4. Click **Run workflow**.
5. When the workflow succeeds, download **BeejRakshak-debug-apk** under Artifacts.
6. Extract `app-debug.apk` and install it on a test device.

The workflow installs Node.js 22, Java 21, Android SDK API 36 and Gradle 8.14.3, then builds the Vite assets, syncs Capacitor and compiles the APK.

## Build locally

Requirements: Node.js 22, JDK 21, Android SDK Platform 36, Android Build Tools 36.0.0, and Gradle 8.14.3.

From the project directory:

```bat
npm install --legacy-peer-deps --no-audit --no-fund
npm run build
npx cap sync android
```

Open the `android` folder in Android Studio (Android Studio Otter 2025.2.1 or newer is required for Capacitor 8), wait for Gradle sync, then select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

If the Gradle wrapper scripts are absent, generate them from the `android` directory using an installed Gradle 8.14.3:

```bat
cd android
gradle wrapper --gradle-version 8.14.3 --distribution-type all
gradlew.bat assembleDebug
```

APK output:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## Notes

- Capacitor 8 requires minSdk 24, compileSdk 36, JDK 21, AGP 8.13.0 and Gradle 8.14.3.
- A debug APK is for testing, not a Play Store release.
- Offline registry and local verification do not require a Gemini API key.
- Cloud AI inspection requires a separately deployed API backend with a valid server-side `GEMINI_API_KEY`. Do not put a private API key in frontend source code or commit `.env` files.
- Camera and location permissions are requested by the app features that use them.
