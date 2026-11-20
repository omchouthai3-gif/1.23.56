/**
 * API routing for browser and native Capacitor builds.
 * Native builds must receive an absolute HTTPS backend URL at build time.
 * Never put GEMINI_API_KEY in VITE_* variables or inside the APK.
 */
export function isNativeCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  return Boolean(win.Capacitor?.isNativePlatform?.());
}

function configuredApiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, '') ?? '';
}

export function hasRemoteApi(): boolean {
  const base = configuredApiBase();
  if (!base) return !isNativeCapacitorApp();

  try {
    const parsed = new URL(base);
    const secure = parsed.protocol === 'https:';
    const localDevelopment = parsed.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '10.0.2.2'].includes(parsed.hostname);
    return secure || localDevelopment;
  } catch {
    return false;
  }
}

export function apiUrl(path: string): string {
  const base = configuredApiBase();
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path;
}
